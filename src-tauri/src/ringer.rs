//! Decides when bells ring. The frontend only pushes today's list.

use std::{
    error::Error,
    fs::File,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};

use chrono::Timelike;
use rodio::{
    OutputStream,
    cpal::{
        self,
        traits::{DeviceTrait, HostTrait},
    },
};
use serde::Deserialize;

#[derive(Deserialize, Clone, Debug, PartialEq)]
pub struct Bell {
    /// second of the day
    pub time: u32,
    pub path: String,
    pub volume: f32,
}

#[derive(Default)]
pub struct Ringer {
    pub bells: Vec<Bell>,
    pub output: String,
    /// how many seconds late a bell may still ring
    pub tolerance: u32,
}

pub type SharedRinger = Arc<Mutex<Ringer>>;

const HALF_DAY: i64 = 12 * 3600;

#[derive(Debug, PartialEq)]
pub struct Tick<'a> {
    pub due: Vec<&'a Bell>,
    /// passed since the last tick, but too late to ring
    pub skipped: Vec<&'a Bell>,
    pub last: i64,
}

/// What to ring at `now`, given the last handled second `last` (both seconds of the day).
pub fn tick(bells: &[Bell], last: i64, now: i64, tolerance: i64) -> Tick<'_> {
    let nothing = |last| Tick { due: vec![], skipped: vec![], last };

    let last = if now >= last {
        // normal tick, or the clock jumped forward
        last
    } else if last - now > HALF_DAY {
        // midnight: a new day starts before 00:00:00
        -1
    } else if last - now <= tolerance {
        // small step back: wait, so bells that already rang do not ring again
        return nothing(last);
    } else {
        // large step back: trust the new clock
        return nothing(now);
    };

    let (due, skipped) = bells
        .iter()
        .filter(|bell| last < bell.time as i64 && bell.time as i64 <= now)
        .partition(|bell| now - bell.time as i64 <= tolerance);
    Tick { due, skipped, last: now }
}

/// Plays a sound file on the named output and waits until it ends.
pub fn play(path: &str, volume: f32, output: &str) -> Result<(), Box<dyn Error>> {
    let device: rodio::Device = cpal::default_host()
        .devices()?
        .find(|device| device.name().is_ok_and(|name| name == output))
        .ok_or_else(|| format!("audio output not found: {output}"))?
        .into();
    let (_stream, stream_handle) = OutputStream::try_from_device(&device)?;
    let sink = stream_handle.play_once(File::open(path)?)?;
    sink.set_volume(volume);
    sink.sleep_until_end();
    Ok(())
}

fn now_second() -> i64 {
    chrono::Local::now().num_seconds_from_midnight() as i64
}

/// Starts the thread that rings the bells of `ringer`.
pub fn start(ringer: SharedRinger) {
    thread::spawn(move || {
        let mut last = now_second();
        loop {
            thread::sleep(Duration::from_millis(200));
            let now = now_second();

            let ringer = ringer.lock().unwrap();
            let result = tick(&ringer.bells, last, now, ringer.tolerance as i64);
            last = result.last;

            for bell in result.skipped {
                println!("skipped (too late): {bell:?} at {now}");
            }
            for bell in result.due {
                println!("ring: {bell:?} at {now}");
                let (bell, output) = (bell.clone(), ringer.output.clone());
                thread::spawn(move || {
                    if let Err(e) = play(&bell.path, bell.volume, &output) {
                        println!("failed to ring {bell:?}: {e}");
                    }
                });
            }
        }
    });
}

#[tauri::command]
pub fn set_bells(
    bells: Vec<Bell>,
    output: String,
    tolerance: u32,
    ringer: tauri::State<SharedRinger>,
) {
    *ringer.lock().unwrap() = Ringer { bells, output, tolerance };
}

#[cfg(test)]
mod tests {
    use super::*;

    fn bell(time: u32) -> Bell {
        Bell { time, path: String::new(), volume: 1.0 }
    }

    /// times of (due, skipped) and the new `last`
    fn run(bells: &[Bell], last: i64, now: i64, tolerance: i64) -> (Vec<u32>, Vec<u32>, i64) {
        let result = tick(bells, last, now, tolerance);
        let times = |list: &[&Bell]| list.iter().map(|bell| bell.time).collect();
        (times(&result.due), times(&result.skipped), result.last)
    }

    const NINE: u32 = 9 * 3600;

    #[test]
    fn rings_once() {
        let bells = [bell(NINE)];
        assert_eq!(run(&bells, 32399, 32399, 5), (vec![], vec![], 32399));
        assert_eq!(run(&bells, 32399, 32400, 5), (vec![NINE], vec![], 32400));
        // later ticks in the same second, and after it
        assert_eq!(run(&bells, 32400, 32400, 5), (vec![], vec![], 32400));
        assert_eq!(run(&bells, 32400, 32401, 5), (vec![], vec![], 32401));
    }

    #[test]
    fn replaced_list_does_not_ring_again() {
        // the same bell pushed again after it rang
        assert_eq!(run(&[bell(NINE)], 32400, 32400, 5).0, Vec::<u32>::new());
        // a bell added for a second that already passed
        assert_eq!(run(&[bell(NINE - 10)], 32400, 32401, 5).0, Vec::<u32>::new());
    }

    #[test]
    fn same_second_bells_all_ring() {
        let bells = [bell(NINE), bell(NINE)];
        assert_eq!(run(&bells, 32399, 32400, 5).0, vec![NINE, NINE]);
    }

    #[test]
    fn forward_jump_within_tolerance_rings_late() {
        let bells = [bell(NINE)];
        assert_eq!(run(&bells, 32399, 32405, 5), (vec![NINE], vec![], 32405));
    }

    #[test]
    fn forward_jump_over_tolerance_skips() {
        let bells = [bell(NINE), bell(NINE + 600)];
        // six seconds late
        assert_eq!(run(&bells, 32399, 32406, 5), (vec![], vec![NINE], 32406));
        // woke up ten minutes later: the old bell is skipped, the current one rings
        assert_eq!(run(&bells, 32399, 33000, 5), (vec![NINE + 600], vec![NINE], 33000));
    }

    #[test]
    fn zero_tolerance_rings_only_on_the_exact_second() {
        let bells = [bell(NINE)];
        assert_eq!(run(&bells, 32399, 32400, 0).0, vec![NINE]);
        assert_eq!(run(&bells, 32399, 32401, 0), (vec![], vec![NINE], 32401));
    }

    #[test]
    fn small_step_back_does_not_ring_again() {
        let bells = [bell(NINE)];
        // rang at 32400, then the clock is set back three seconds
        assert_eq!(run(&bells, 32400, 32397, 5), (vec![], vec![], 32400));
        // 32400 comes round again
        assert_eq!(run(&bells, 32400, 32400, 5), (vec![], vec![], 32400));
        assert_eq!(run(&bells, 32400, 32401, 5), (vec![], vec![], 32401));
    }

    #[test]
    fn large_step_back_follows_the_new_clock() {
        let bells = [bell(NINE)];
        // the clock was an hour fast and is corrected
        assert_eq!(run(&bells, 32400 + 3600, 32390, 5), (vec![], vec![], 32390));
        assert_eq!(run(&bells, 32390, 32400, 5).0, vec![NINE]);
    }

    #[test]
    fn midnight() {
        let bells = [bell(0), bell(86399), bell(NINE)];
        assert_eq!(run(&bells, 86398, 86399, 5), (vec![86399], vec![], 86399));
        assert_eq!(run(&bells, 86399, 0, 5), (vec![0], vec![], 0));
        // midnight passed between two ticks
        assert_eq!(run(&bells, 86399, 2, 5), (vec![0], vec![], 2));
        assert_eq!(run(&bells, 2, 3, 5), (vec![], vec![], 3));
    }
}
