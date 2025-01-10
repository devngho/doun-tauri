export class Time {
	constructor(
		public hour: number,
		public minute: number,
		public second: number
	) { }

	static now(): Time {
		const now = new Date();
		return new Time(now.getHours(), now.getMinutes(), now.getSeconds());
	}

	fix() {
		// write a code to fix time right
		// right time: 0 .. second .. 59, 0 .. minute .. 59, 0 .. hour .. 23
		// if second is 60 or more, add to minute
		// if second is less than 0, subtract from minute
		// example: 0:0:70 -> 0:1:10, 0:1:-10 -> 0:0:50
		if (this.second >= 60 || this.second < 0) {
			this.minute += Math.floor(this.second / 60);
			this.second = (this.second % 60 + 60) % 60;
		}
		if (this.minute >= 60 || this.minute < 0) {
			this.hour += Math.floor(this.minute / 60);
			this.minute = (this.minute % 60 + 60) % 60;
		}
		if (this.hour >= 24 || this.hour < 0) {
			this.hour = (this.hour % 24 + 24) % 24;
		}

		return this;
	}

	formatTime(): string {
		return `${Math.abs(this.hour).toLocaleString("ko-KR", {
			minimumIntegerDigits: 2,
			useGrouping: false,
		})}:${Math.abs(this.minute).toLocaleString("ko-KR", {
			minimumIntegerDigits: 2,
			useGrouping: false,
		})}:${Math.abs(this.second).toLocaleString("ko-KR", {
			minimumIntegerDigits: 2,
			useGrouping: false,
		})}`;
	}

	toString(): string {
		return `{${this.hour}:${this.minute}:${this.second}}`;
	}

	compare(other: Time): number {
		return this.hour * 3600 + this.minute * 60 + this.second - other.hour * 3600 - other.minute * 60 - other.second;
	}
}

export class Dates {
	constructor(
		public year: number,
		public month: number,
		public day: number
	) { }

	static now(): Dates {
		const now = new Date();
		return new Dates(now.getFullYear(), now.getMonth() + 1, now.getDate());
	}

	formatTime(): string {
		return `${Math.abs(this.year).toLocaleString("ko-KR", {
			minimumIntegerDigits: 2,
			useGrouping: false,
		})}-${Math.abs(this.month).toLocaleString("ko-KR", {
			minimumIntegerDigits: 2,
			useGrouping: false,
		})}-${Math.abs(this.day).toLocaleString("ko-KR", {
			minimumIntegerDigits: 2,
			useGrouping: false,
		})}`;
	}

	static parseDate(str: string): Dates {
		const date = new Date(str);
		return new Dates(date.getFullYear(), date.getMonth() + 1, date.getDate());
	}

	toString(): string {
		return `{${this.year}:${this.month}:${this.day}}`;
	}

	compare(other: Dates): number {
		return this.year * 372 + this.month * 31 + this.day - other.year * 372 - other.month * 31 - other.day;
	}
}

export enum DayOfWeek {
	월 = "월",
	화 = "화",
	수 = "수",
	목 = "목",
	금 = "금",
	토 = "토",
	일 = "일"
}

export function nowDayOfWeek(): DayOfWeek {
	switch (new Date().getDay()) {
		case 0:
			return DayOfWeek.일;
		case 1:
			return DayOfWeek.월;
		case 2:
			return DayOfWeek.화;
		case 3:
			return DayOfWeek.수;
		case 4:
			return DayOfWeek.목;
		case 5:
			return DayOfWeek.금;
		case 6:
			return DayOfWeek.토;
		default:
			return DayOfWeek.월;
	}
}

export function compareDayOfWeek(a: DayOfWeek, b: DayOfWeek): number {
	const days = [DayOfWeek.월, DayOfWeek.화, DayOfWeek.수, DayOfWeek.목, DayOfWeek.금, DayOfWeek.토, DayOfWeek.일];
	return days.indexOf(a) - days.indexOf(b);
}