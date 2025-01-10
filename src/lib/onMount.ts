import { get } from "svelte/store";
import { loadAll, now, saveAll, schedule, settings } from "./store";
import { invokeTS } from "./tauri_invoker";
import { Time } from "./daytime";
import { isDev } from "./dev";
import { log } from "./logger";
import { refresh } from "./play";
import { setInterval, setTimeout } from "worker-timers";
import { updateSchedules } from "./schedule";
import { redirect } from "./page";

export async function onMount() {
	log({ message: "onMount" })

	const time = new Date();
	const durationNextSecond = 1000 - time.getMilliseconds();

	log({ message: "onMount", data: { time, durationNextSecond } })
	setTimeout(() => {
		log({ message: "started time updation from worker", data: { time: new Date() } })
		setInterval(() => {
			now.set(Time.now());
		}, 100);
	}, durationNextSecond)

	// setInterval(() => {
	// 	saveAll()
	// }, 5000)
	const isFirstLaunch = await invokeTS('is_first_launch', null)
	if (isFirstLaunch) {
		redirect('introduce0')
	}
	await loadAll()

	isDev.set(get(settings).dev ?? await invokeTS('check_is_dev', null));
	log({ message: "init setting load", data: get(settings) })

	now.subscribe(() => {
		refresh()
	})

	schedule.subscribe(() => {
		refresh(true)
	})

	updateSchedules()

	checkNoSleep()

	// if (get(isDev)) test()
}

function checkNoSleep() {
	if (get(settings).useAutoSleep) {
		// for macos, using caffinate for 10 minutes
		invokeTS('call_command_line', { 'command': 'caffeinate', args: ['-t', '605'] })
		setTimeout(checkNoSleep, 10 * 60 * 1000)
	} else setTimeout(checkNoSleep, 10000)
}
