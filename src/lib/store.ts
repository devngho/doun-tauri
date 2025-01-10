import { get, writable, type Writable } from "svelte/store";
import { invokeTS } from "./tauri_invoker";
import { updateSchedules, type ScheduleCompiled, Schedules, Schedule } from "./schedule";
import { nowDayOfWeek, Time } from "./daytime";
import { log } from "./logger";
import { currentOS } from "./platform";
import { rgbToHex } from "./color";

export const now = writable(Time.now());
export const schedule = writable([] as Schedule[]);
export const scheduleCompiled = writable([] as ScheduleCompiled[]);
export const schedules = writable({} as { [key: string]: Schedules });
export const volumeMixer = writable({} as { [key: string]: number })
export const saveState = writable('ok' as 'ok' | 'working' | 'error');
export const nextSchedule = writable<ScheduleCompiled | undefined>({} as ScheduleCompiled | undefined);
export const remainTime = writable(new Time(24, 0, 0));
export type SettingType = {
	theme: 'light' | 'dark',
	dev: boolean | null,
	useAutoSleep: boolean,
	useSlim: boolean,
	audioOutput: string,
	superDoun: boolean,
	primaryColor: string,
	delayTime: number,
	autoSchedule: {
		enabled: boolean,
		schoolType: 'elementary' | 'middle' | 'high',
		eduOfficeCode: string,
		schoolCode: string,
		apiKey: string,
		defaultPeriodTime: number
	}
}
export const settings = writable<SettingType>({
	'theme': 'dark',
	'dev': false,
	'useAutoSleep': true,
	'useSlim': true,
	'audioOutput': 'lateinit',
	'superDoun': false,
	'primaryColor': rgbToHex(59, 130, 246),
	'delayTime': 10,
	'autoSchedule': {
		'enabled': true,
		'schoolType': 'elementary',
		'eduOfficeCode': '',
		'schoolCode': '',
		'apiKey': '',
		'defaultPeriodTime': 40
	}
})

export function saveAll() {
	saveState.set('working');
	const data = JSON.stringify(saveAllAsRaw());
	return invokeTS('save_data', { 'data': data })
		.then((v) => {
			if (v) saveState.set('ok');
			else saveState.set('error');
		})
}

export function saveAllAsRaw() {
	const data = {
		'schedules': Object.fromEntries(Object.entries(get(schedules)).toSorted((a, b) => a[1].getName().localeCompare(b[1].getName())).map((v) => {
			return [v[0], v[1].copy()]
		})),
		'schedule': get(schedule),
		'volumeMixer': get(volumeMixer) || {},
		'settings': get(settings),
	}
	return data;
}

export async function loadAll() {
	const defaultOutput = await invokeTS('get_default_audio_output', null);
	return invokeTS('load_data', {
		'default': JSON.stringify({
			'schedules': {},
			'schedule': [],
			'volumeMixer': {},
			'settings': {
				"theme": "dark",
				"dev": false,
				"useAutoSleep": true,
				"useSlim": true,
				"audioOutput": defaultOutput,
				"superDoun": false,
				"primaryColor": rgbToHex(59, 130, 246),
				"delayTime": 10,
				"autoSchedule": {
					"enabled": true,
					"schoolType": "elementary",
					"eduOfficeCode": "",
					"schoolCode": "",
					"apiKey": "",
					"defaultPeriodTime": 40
				}
			},
		})
	}).then(data => {
		const parsedData = JSON.parse(data);
		const newSchedules = parsedData.schedules;
		for (const key in newSchedules) {
			newSchedules[key] = new Schedules(newSchedules[key]);
		}
		for (const key in newSchedules) {
			const newSchedule = newSchedules[key].schedules;
			Schedules.addDetails(newSchedule);
			newSchedules[key].schedules = newSchedule;
		}

		const newSchedule = parsedData.schedule;
		Schedules.addDetails(newSchedule);
		if (typeof parsedData.volumeMixer !== 'object') parsedData.volumeMixer = {}

		schedules.set(newSchedules);
		schedule.set(newSchedule);
		volumeMixer.set(parsedData.volumeMixer);

		const parsedSettings = parsedData.settings;
		if (currentOS === "macos")
			parsedData.audioOutput = defaultOutput;
		settings.set(parsedSettings);

		log({ message: 'raw parsed data', data: parsedData })

		settings.update((v) => {
			return {
				theme: v?.theme ?? 'light',
				dev: v?.dev ?? null,
				useAutoSleep: v?.useAutoSleep ?? true,
				useSlim: v?.useSlim ?? true,
				audioOutput: v?.audioOutput ?? defaultOutput,
				superDoun: v?.superDoun ?? false,
				primaryColor: v?.primaryColor ?? rgbToHex(59, 130, 246),
				delayTime: v?.delayTime ?? 10,
				autoSchedule: v?.autoSchedule ?? {
					enabled: v?.autoSchedule?.enabled ?? true,
					schoolType: v?.autoSchedule?.schoolType ?? 'elementary',
					eduOfficeCode: v?.autoSchedule?.eduOfficeCode ?? '',
					schoolCode: v?.autoSchedule?.schoolCode ?? '',
					apiKey: v?.autoSchedule?.apiKey ?? '',
					defaultPeriodTime: v?.autoSchedule?.defaultPeriodTime ?? 40
				}
			}
		})
	})
}

export const isError: Writable<"findSchedule" | "parseSchedule" | null> = writable(null);

export const daysOfWeek = writable(nowDayOfWeek());
now.subscribe(() => {
	if (nowDayOfWeek() !== get(daysOfWeek)) {
		log({ message: "day of week changed; updating schedules" })
		daysOfWeek.set(nowDayOfWeek());
		updateSchedules();
	}
})
schedules.subscribe(() => {
	log({ message: "schedules updated; updating schedules" })
	updateSchedules()
});