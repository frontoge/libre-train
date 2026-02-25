import type { Dayjs } from "dayjs";

export type WeekRange = {
    start: string;
    end: string;
}

export function getWeekRange(date: Dayjs): WeekRange {
    const startOfWeek = date.startOf('week');
    const endOfWeek = date.endOf('week');
    
    return {
        start: startOfWeek.format("YYYY-MM-DD"),
        end: endOfWeek.format("YYYY-MM-DD")
    };
}

export function stringFormatDate(date: Date, separator: string = "-"): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}`;
}

export function stringFormatCondensedDate(date: Date, separator: string = "-"): string {
    const year = date.getFullYear() % 100;;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${month}${separator}${year}`;
}