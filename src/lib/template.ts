import { Dates, DayOfWeek, Time } from "./daytime";
import { DelaySchedule, GroupSchedule, Schedule, SingleSchedule, type Schedules } from "./schedule";

// the fields that decide when a template applies; exactly one kind is set
export type TemplateMeta = Pick<Schedules, "name" | "dayOfWeek" | "timeTableCount" | "timeTableLength" | "specifyDate">;
export type TemplateType = "name" | "dayOfWeek" | "timeTableCount" | "specifyDate";

export function typeOfMeta(meta: TemplateMeta): TemplateType | undefined {
	if (meta.name !== undefined) return "name";
	if (meta.specifyDate !== undefined) return "specifyDate";
	if (meta.dayOfWeek !== undefined) return "dayOfWeek";
	if (meta.timeTableCount !== undefined) return "timeTableCount";
}

// default meta of a type; other fields are explicitly cleared
export function metaOfType(type: TemplateType): TemplateMeta {
	const meta: TemplateMeta = {
		name: undefined,
		dayOfWeek: undefined,
		timeTableCount: undefined,
		timeTableLength: undefined,
		specifyDate: undefined,
	};
	switch (type) {
		case "name":
			return { ...meta, name: "" };
		case "dayOfWeek":
			return { ...meta, dayOfWeek: DayOfWeek.월 };
		case "timeTableCount":
			return { ...meta, timeTableCount: 7, timeTableLength: 45 };
		case "specifyDate":
			return { ...meta, specifyDate: Dates.now() };
	}
}

// a schedule as edited in the template editor (plain, so $state tracks it)
// number inputs are null while empty
export type Row = { id: string; name: string } & (
	| { kind: "single"; sound: string }
	| { kind: "delay"; hour: number | null; minute: number | null; second: number | null }
	| { kind: "group"; scheduleId: string }
);
export type DelayRow = Extract<Row, { kind: "delay" }>;

export function delayOf(row: DelayRow): number {
	return (row.hour ?? 0) * 3600 + (row.minute ?? 0) * 60 + (row.second ?? 0);
}

export function toRow(schedule: Schedule): Row {
	const base = { id: crypto.randomUUID(), name: schedule.name };
	if (schedule instanceof DelaySchedule) {
		const { hour, minute, second } = new Time(0, 0, schedule.delay).fix();
		return { ...base, kind: "delay", hour, minute, second };
	}
	if (schedule instanceof GroupSchedule)
		return { ...base, kind: "group", scheduleId: schedule.scheduleId };
	return { ...base, kind: "single", sound: schedule.sound };
}

export function toSchedule(row: Row): Schedule {
	switch (row.kind) {
		case "delay":
			return new DelaySchedule(row.name, delayOf(row));
		case "group":
			return new GroupSchedule(row.name, row.scheduleId);
		case "single":
			return new SingleSchedule(row.name, row.sound);
	}
}
