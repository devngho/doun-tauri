import { get } from "svelte/store";
import { isError, schedule, schedules, settings } from "./store";
import { invokeTS } from "./tauri_invoker";
import { Time, type DayOfWeek, nowDayOfWeek, Dates } from "./daytime";
import { log } from "./logger";

export abstract class Schedule {
	abstract name: string;
	abstract sound: string;

	abstract compile(): Schedule[];
	abstract copy(): Schedule;

	static compileAll(
		target: Schedule[],
		depth: number = 0,
		calledFrom?: string,
		calledFromGroup?: string
	): Schedule[] {
		if (depth > 100) return [new SingleSchedule("스케줄이 순환함", "_error", (calledFrom ?? "") + (calledFromGroup ? get(schedules)[calledFromGroup].name : "알 수 없음") + " 스케줄을 포함")];
		const flatSchedules = [] as Schedule[];
		for (const [idx, schedule] of target.entries()) {
			if (schedule instanceof SingleSchedule || schedule instanceof DelaySchedule) {
				const newSchedule = schedule.copy();
				//@ts-ignore
				newSchedule.parent = calledFromGroup;
				flatSchedules.push(newSchedule);
			}
			else if (schedule instanceof GroupSchedule) flatSchedules.push(...this.compileAll(schedule.compile(), depth + 1, `${calledFromGroup ? get(schedules)[calledFromGroup].name : "알 수 없음"}의 ${idx + 1}번째 스케줄 ${schedule.name}, `, schedule.scheduleId))
		}
		return flatSchedules;
	}

	static compileAsTime(
		schedules: Schedule[]
	): ScheduleCompiled[] {
		const flatSchedules = [] as ScheduleCompiled[];
		let delayedTime = new Time(0, 0, 0);
		for (const schedule of schedules) {
			if (schedule instanceof DelaySchedule) {
				delayedTime = new Time(delayedTime.hour, delayedTime.minute, delayedTime.second + schedule.delay).fix();
				flatSchedules.push({
					...schedule,
					sound: '_delayed',
					time: delayedTime,
				})
			} else if (schedule instanceof SingleSchedule) {
				flatSchedules.push({
					...schedule,
					time: delayedTime,
				})
			} else if (schedule instanceof GroupSchedule) {
				const totalDelay =
					Schedule.compileAll([schedule])
						.filter(schedule => schedule instanceof DelaySchedule)
						.reduce((prev, curr) => prev + (curr as DelaySchedule).delay, 0);
				delayedTime = new Time(delayedTime.hour, delayedTime.minute, delayedTime.second + totalDelay).fix();;
				flatSchedules.push({
					...schedule,
					group: schedule.scheduleId,
					sound: "_grouped",
					time: delayedTime,
					delay: totalDelay,
				})
			}
		}
		return flatSchedules;
	}
}

export class SingleSchedule implements Schedule {
	constructor(public name: string, public sound: string, public group?: string) { }

	compile(): Schedule[] {
		return [this];
	}
	copy(): Schedule {
		return new SingleSchedule(this.name, this.sound, this.group);
	}
}

export class DelaySchedule implements Schedule {
	constructor(public name: string, public delay: number) { }
	sound: string = "";
	_hour: number | undefined = undefined;
	_minute: number = 0;
	_second: number = 0;

	compile(): Schedule[] {
		return [this];
	}
	copy(): Schedule {
		return new DelaySchedule(this.name, this.delay);
	}
}

export class GroupSchedule implements Schedule {
	public sound: string = "_grouped";
	constructor(
		public name: string,
		public scheduleId: string
	) { }

	compile(): Schedule[] {
		if (get(schedules)[this.scheduleId] === undefined) return [new SingleSchedule("스케줄을 찾을 수 없음", "_error")];
		if (get(schedules)[this.scheduleId].schedules === undefined) return [new SingleSchedule("스케줄을 찾을 수 없음", "_error")];
		if (get(schedules)[this.scheduleId].schedules.includes(this)) return [new SingleSchedule("스케줄이 순환함", "_error")];
		return get(schedules)[this.scheduleId].schedules;
	}
	copy(): Schedule {
		return new GroupSchedule(this.name, this.scheduleId);
	}
}

export interface ScheduleCompiled {
	name: string;
	sound: string;
	time: Time;
	delay?: number;
	group?: string;
}

export class Schedules {
	schedules: Schedule[] = [];
	name?: string;
	dayOfWeek?: DayOfWeek;
	timeTableCount?: number;
	timeTableLength?: number;
	specifyDate?: Dates;

	constructor(data: {
		name?: string;
		dayOfWeek?: DayOfWeek;
		timeTableCount?: number;
		timeTableLength?: number;
		specifyDate?: Dates;
		schedules: Schedule[];
	}) {
		this.name = data?.name;
		this.dayOfWeek = data?.dayOfWeek;
		this.timeTableCount = data?.timeTableCount;
		this.timeTableLength = data?.timeTableLength;
		this.specifyDate = data?.specifyDate;
		this.schedules = data?.schedules;

		if (this.specifyDate !== undefined && !(this.specifyDate instanceof Dates)) {
			this.specifyDate = new Dates(
				//@ts-ignore
				this.specifyDate.year,
				//@ts-ignore
				this.specifyDate.month,
				//@ts-ignore
				this.specifyDate.day
			);
		}
	}

	getName(): string {
		if (this.name) return this.name;
		else if (this.specifyDate) return `${this.specifyDate.formatTime()}`
		else if (this.dayOfWeek) return `${this.dayOfWeek}요일`
		else if (this.timeTableCount) return `${this.timeTableCount}교시(${this.timeTableLength}분)`
		else return ""
	}

	copy(): Schedules {
		return new Schedules({
			name: this.name,
			dayOfWeek: this.dayOfWeek,
			timeTableCount: this.timeTableCount,
			timeTableLength: this.timeTableLength,
			specifyDate: this.specifyDate,
			schedules: this.schedules.map((v) => v.copy()),
		})
	}

	static addDetails(newSchedule: Schedule[]) {
		for (const key in newSchedule) {
			//@ts-ignore
			if (newSchedule[key].delay !== undefined)
				newSchedule[key] = new DelaySchedule(
					newSchedule[key].name,
					//@ts-ignore
					newSchedule[key].delay
				);
			//@ts-ignore
			else if (newSchedule[key].scheduleId !== undefined)
				newSchedule[key] = new GroupSchedule(
					newSchedule[key].name,
					//@ts-ignore
					newSchedule[key].scheduleId
				);
			else
				newSchedule[key] = new SingleSchedule(
					newSchedule[key].name,
					newSchedule[key].sound,
					//@ts-ignore
					newSchedule[key].scheduleId
				);
		}
	}
}

// export async function getDayFromSchool() {
//     return await invokeTS('get_website_text', { url: 'http://dsms.mireene.com/xe?mid=intro' })
// 		.then((html) => {
// 			try {
// 				const parser = new DOMParser();
// 				const doc = parser.parseFromString(html, 'text/html');
// 				let month: number = Dates.now().month, day: number = Dates.now().day;
// 				Array.from(doc.querySelectorAll("td")).forEach((v) => {
// 					const r = /(?<month>[0-9]+)+월(?<day>[0-9]+)일/.exec(v.innerText.replaceAll("\n","").substring(1))
// 					if (r?.groups !== undefined) {
// 						month = parseInt(r.groups.month);
// 						day = parseInt(r.groups.day);	
// 					}
// 				})

// 				const [startTimeText, endTimeText] = 
// 					doc.querySelectorAll('td[width="62"]')[1]!!.textContent!!
// 						.substring(4)
// 						.replace('\n', '')
// 						.replace(' ', '')
// 						.split('~');

// 				const startTime = new Time(
// 					parseInt(startTimeText.split(':')[0]),
// 					parseInt(startTimeText.split(':')[1]),
// 					0,
// 				);
// 				const endTime = new Time(
// 					parseInt(endTimeText.split(':')[0]),
// 					parseInt(endTimeText.split(':')[1]),
// 					0
// 				);
// 				const maxPeriod = 
// 					Math.max(
// 						...((Array.from(doc.querySelectorAll('td[width="62"]')) as HTMLTableCellElement[])
// 							.map((v) => /(?<period>[0-9])교시.+/.exec(v.innerText.replaceAll("\n", ""))?.groups?.period)
// 							.filter((v) => v).map((v) => parseInt(v!)))
// 					)

// 				return {
// 					month: month,
// 					day: day,
// 					startTime,
// 					endTime,
// 					maxPeriod
// 				}
// 			} catch (e) {
// 				return {
// 					month: 0,
// 					day: 0,
// 					startTime: new Time(9, 0, 0),
// 					endTime: new Time(9, 45, 0),
// 					maxPeriod: 6
// 				}
// 			}
// 		});
// }

export async function getDayFromAPI() {
	const { apiKey, eduOfficeCode, schoolCode, schoolType } = get(settings).autoSchedule;
	let path: string;
	switch (schoolType) {
		case "elementary":
			path = "elsTimetable";
			break;
		case "middle":
			path = "misTimetable";
			break;
		case "high":
			path = "hisTimetable";
			break;
	}
	log({ message: "loading timetable", data: { apiKey, eduOfficeCode, schoolCode, schoolType, url: `https://open.neis.go.kr/hub/${path}?KEY=${apiKey}&Type=json&ATPT_OFCDC_SC_CODE=${eduOfficeCode}&SD_SCHUL_CODE=${schoolCode}&ALL_TI_YMD=` + `${(new Date().getFullYear()).toString().padStart(2, '0')}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(new Date().getDate()).toString().padStart(2, '0')}` } })
	const result = await fetch(
		`https://open.neis.go.kr/hub/${path}?KEY=${apiKey}&Type=json&ATPT_OFCDC_SC_CODE=${eduOfficeCode}&SD_SCHUL_CODE=${schoolCode}&ALL_TI_YMD=` + `${(new Date().getFullYear()).toString().padStart(2, '0')}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(new Date().getDate()).toString().padStart(2, '0')}`
	)
		.then((response) => response.json())
		.then((json) => {
			log({ message: "loaded timetable", data: json })
			return json
		})
		.then((json) => {
			if ((json[path]?.length !== 2) || ((json[path][1]?.row?.length ?? 0) === 0)) return [{ ALL_TI_YMD: Dates.now().formatTime().replaceAll('-', ''), PERIO: '0' }];
			return json[path][1].row as {
				ALL_TI_YMD: string
				ATPT_OFCDC_SC_CODE: string
				ATPT_OFCDC_SC_NM: string
				AY: string
				CLASS_NM: string
				DGHT_CRSE_SC_NM: string
				GRADE: string
				ITRT_CNTNT: string
				LOAD_DTM: string
				PERIO: string
				SCHUL_NM: string
				SD_SCHUL_CODE: string
			}[]
		})
	const month = parseInt(result[0].ALL_TI_YMD.substring(4, 6));
	const day = parseInt(result[0].ALL_TI_YMD.substring(6, 8));
	const startTime = new Time(9, 0, 0);
	let endTime: Time = new Time(9, get(settings).autoSchedule.defaultPeriodTime, 0).fix()
	const maxPeriod = result.map((v) => parseInt(v.PERIO)).reduce((prev, curr) => Math.max(prev, curr), 0);
	return { month, day, startTime, endTime, maxPeriod };
}

export async function updateSchedules(
	fetchData:
		(() => Promise<{ month: number, day: number, startTime: Time, endTime: Time, maxPeriod: number }>) | null = null
) {
	if (!get(settings).autoSchedule.enabled) return;
	if (fetchData === null) fetchData = getDayFromAPI;

	const { startTime, endTime, month, day, maxPeriod } = await fetchData();

	const timeTableLength =
		endTime.compare(startTime) / 60

	console.log(timeTableLength, maxPeriod);

	// getting schedules that fits today conditions
	// 1. specifyDate
	const specifyDateSchedules = Object.entries(get(schedules)).filter((schedule) => {
		if (schedule[1].specifyDate === undefined) return false;
		return schedule[1].specifyDate.compare(Dates.now()) === 0;
	})[0];

	// 2. dayOfWeek
	const dayweekSchedules = Object.entries(get(schedules)).filter((schedule) => {
		if (schedule[1].dayOfWeek === undefined) return false;
		return schedule[1].dayOfWeek === nowDayOfWeek();
	})[0];

	// 3. timeTable
	const timeTableSchedules = (month == new Date().getMonth() + 1 && day == new Date().getDate()) ? Object.entries(get(schedules)).filter((schedule) => {
		if (schedule[1].timeTableCount === undefined) return false;
		return schedule[1].timeTableCount === maxPeriod && schedule[1].timeTableLength === timeTableLength;
	})[0] : null;

	log({ message: "loaded timetable", data: { specifyDateSchedules, dayweekSchedules, timeTableSchedules } })

	// priority: specifyDate > dayOfWeek > timeTable
	const newSchedule = specifyDateSchedules ?? dayweekSchedules ?? timeTableSchedules ?? undefined;
	if (newSchedule !== undefined) {
		schedule.set(newSchedule[1].schedules);
		isError.set(get(isError) === 'parseSchedule' ? 'parseSchedule' : null)
	} else {
		isError.set('findSchedule')
	}
}