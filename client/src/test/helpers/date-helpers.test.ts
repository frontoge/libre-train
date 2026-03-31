import { describe, expect, it } from 'vitest';
import dayjs from '../../config/dayjs';
import {
	getWeekRange,
	getYearsSinceDate,
	secondsToTimeString,
	stringFormatCondensedDate,
	stringFormatDate,
	timeStringToSeconds,
} from '../../helpers/date-helpers';

describe('date-helpers', () => {
	describe('getWeekRange', () => {
		it('returns the start and end of the week for a given date', () => {
			const targetDate = dayjs('2026-03-18');

			expect(getWeekRange(targetDate)).toEqual({
				start: '2026-03-15',
				end: '2026-03-21',
			});
		});
	});

	describe('stringFormatDate', () => {
		it('formats a date with the default separator', () => {
			const date = new Date(2026, 2, 5);

			expect(stringFormatDate(date)).toBe('2026-03-05');
		});

		it('formats a date with a custom separator', () => {
			const date = new Date(2026, 2, 5);

			expect(stringFormatDate(date, '/')).toBe('2026/03/05');
		});
	});

	describe('stringFormatCondensedDate', () => {
		it('formats a date as MM-YY by default', () => {
			const date = new Date('2026-03-15T12:00:00Z');

			expect(stringFormatCondensedDate(date)).toBe('03-26');
		});

		it('formats a date as MMYY with a custom separator', () => {
			const date = new Date('2026-03-15T12:00:00Z');

			expect(stringFormatCondensedDate(date, '/')).toBe('03/26');
		});
	});

	describe('timeStringToSeconds', () => {
		it('converts hh:mm:ss to seconds', () => {
			expect(timeStringToSeconds('01:02:03')).toBe(3723);
		});

		it('converts mm:ss to seconds', () => {
			expect(timeStringToSeconds('02:03')).toBe(123);
		});

		it('converts ss to seconds', () => {
			expect(timeStringToSeconds('45')).toBe(45);
		});
	});

	describe('secondsToTimeString', () => {
		it('formats seconds into mm:ss when less than one hour', () => {
			expect(secondsToTimeString(123)).toBe('02:03');
		});

		it('formats seconds into hh:mm:ss when one hour or more', () => {
			expect(secondsToTimeString(3723)).toBe('01:02:03');
		});
	});

	describe('getYearsSinceDate', () => {
		it('returns the elapsed full years since the given date', () => {
			const date = dayjs().subtract(10, 'year').subtract(1, 'day').format('YYYY-MM-DD');

			expect(getYearsSinceDate(date)).toBe(10);
		});

		it('floors the value when the year has not fully elapsed', () => {
			const date = dayjs().subtract(10, 'year').add(1, 'day').format('YYYY-MM-DD');

			expect(getYearsSinceDate(date)).toBe(9);
		});
	});
});
