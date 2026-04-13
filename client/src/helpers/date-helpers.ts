import type { Dayjs } from 'dayjs';
import dayjs from '../config/dayjs';

export type WeekRange = {
	start: string;
	end: string;
};

export function getWeekRange(date: Dayjs): WeekRange {
	const startOfWeek = date.startOf('week');
	const endOfWeek = date.endOf('week');

	return {
		start: startOfWeek.format('YYYY-MM-DD'),
		end: endOfWeek.format('YYYY-MM-DD'),
	};
}

export function stringFormatDate(date: Date, separator: string = '-'): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}${separator}${month}${separator}${day}`;
}

export function stringFormatCondensedDate(date: Date, separator: string = '-'): string {
	return dayjs.tz(date).format(`MM${separator}YY`);
}

export function timeStringToSeconds(time: string): number {
	const parts = time.split(':').map(Number);
	let total = 0;

	if (parts.length === 3) {
		total += parts[0] * 3600; // hours to seconds
	}
	if (parts.length >= 2) {
		total += parts[parts.length - 2] * 60; // minutes to seconds
	}
	total += parts[parts.length - 1]; // seconds

	return total;
}

export function secondsToTimeString(seconds: number): string {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hrs > 0) {
		const hrsStr = String(hrs) + ':';
		const minsStr = String(mins).padStart(2, '0') + ':';
		const secsStr = String(secs).padStart(2, '0');
		return `${hrsStr}${minsStr}${secsStr}`;
	}

	if (mins > 0) {
		const minsStr = String(mins) + ':';
		const secsStr = String(secs).padStart(2, '0');
		return `${minsStr}${secsStr}`;
	}

	return String(secs);
}

export function getYearsSinceDate(date: string): number {
	const now = dayjs();
	const pastDate = dayjs(date);
	return Math.floor(now.diff(pastDate, 'year'));
}
