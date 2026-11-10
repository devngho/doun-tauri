import { get, writable, type Writable } from "svelte/store";
import { isError, nextSchedule, now, remainTime, schedule, schedules, settings, volumeMixer } from "./store";
import { Schedule, type ScheduleCompiled, type Schedules } from "./schedule";
import { invokeTS } from "./tauri_invoker";
import { Time } from "./daytime";
import { log } from "./logger";

export let appliedSchedule: Writable<Schedules | null> = writable(null);
export let lastSchedule: Writable<Schedule[]> = writable([]);
export let lastComputed: Writable<ScheduleCompiled[]> = writable([]);

export function refresh(force: boolean = false) {
    if (
        get(schedule) !== get(lastSchedule) ||
        force ||
        get(lastComputed).length === 0
    ) {
        lastSchedule.set(get(schedule));
        lastComputed.set(Schedule.compileAsTime(
            Schedule.compileAll(get(schedule))
        ));
        isError.set(
            get(lastComputed).find((v) => v.sound === "_error") !== undefined
                ? "parseSchedule"
                : get(isError) == "findSchedule"
                ? "findSchedule"
                : null)

        appliedSchedule.set(
            Object.entries(get(schedules)).find(
                (v) => v[1].schedules === get(schedule)
            )?.[1] ?? null);
    }

    nextSchedule.set(get(lastComputed)
        .filter((v) => v.sound !== "_delayed")
        .find((v) => v.time.compare(get(now)) >= 0));

    if (get(nextSchedule))
        remainTime.set(new Time(
            0,
            0,
            get(nextSchedule)!.time.compare(get(now))
        ).fix());
    else remainTime.set(new Time(24, 0, 0));
}

let lastPushed = "";

// sends today's bells to the backend, which decides when to ring them
export function pushBells() {
    const { audioOutput, lateTolerance } = get(settings);
    const mixer = get(volumeMixer);
    const args = {
        bells: get(lastComputed)
            // entries like _delayed and _error are not sounds
            .filter((v) => v.sound !== "" && !v.sound.startsWith("_"))
            .map((v) => ({
                time: v.time.hour * 3600 + v.time.minute * 60 + v.time.second,
                path: v.sound,
                volume: mixer[v.sound] ?? 1.0,
            })),
        output: audioOutput,
        tolerance: Math.max(0, Math.round(Number(lateTolerance) || 0)),
    };

    // the stores also fire when nothing relevant changed
    const pushed = JSON.stringify(args);
    if (pushed === lastPushed) return;
    lastPushed = pushed;
    invokeTS("set_bells", args);
}

export function delayCurrent() {
    lastComputed.update((v) => {
        const last = v.find((w) => {
            return w.time.compare(Time.now()) >= 0 && w.sound !== "_delayed"
        }) as ScheduleCompiled;
        log({
            data: last,
            message: "delay current taget"
        })
        return v.map((w) => {
            if (w !== last) return w;
            else {
                const added = last.time;
                added.second += get(settings).delayTime
                added.fix()
                last.time = added
                return last
            }
        });
    })
}