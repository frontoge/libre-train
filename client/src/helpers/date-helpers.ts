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