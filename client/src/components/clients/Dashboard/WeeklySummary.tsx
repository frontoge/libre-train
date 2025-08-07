/*
    Week selection
    Avg Weight (+/- diff)
    avg calories (+/- diff)
    avg body fat (+/- diff)
    avg lean mass (+/- diff)

    calorie deficiency/surplus
    macro adherence %
    chart?
*/

import { Card, DatePicker, Progress, Statistic } from "antd";
import "../../../styles/ClientDashboard/weekly-summary.css";
import { Dayjs } from "dayjs";
import React from "react";
import { getWeekRange } from "../../../helpers/date-helpers";


export function WeeklySummary() {

    const [selectedWeek, setSelectedWeek] = React.useState<Dayjs | undefined>(undefined);

    React.useEffect(() => {
        const weekRange = selectedWeek ? getWeekRange(selectedWeek) : { start: '', end: '' };
        console.log(`Selected week range: ${weekRange.start} to ${weekRange.end}`);
    }, [selectedWeek])

    const handleWeekChange = (date: Dayjs | null, dateString: string | string[]) => {
        setSelectedWeek(date ?? undefined);
    }

    return (
        <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            gap: '2rem'
        }}>
            <DatePicker picker="week" style={{width: "20%", marginTop: "0.5rem"}} onChange={handleWeekChange} />
            <div className="summary-statistics" style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
            }}>
                <Card variant="outlined" className="weekly-summary-card">
                    <Statistic title="Weight" value={170} precision={1} suffix="lbs" />
                </Card>
                <Card variant="outlined" className="weekly-summary-card">
                    <Statistic title="Body Fat" value={17} precision={1} suffix="%" />
                </Card>
                <Card variant="outlined" className="weekly-summary-card">
                    <Statistic title="Lean Mass" value={150} precision={1} suffix="lbs" />
                </Card>
                <Card variant="outlined" className="weekly-summary-card">
                    <Statistic title="Calories" value={2189} precision={0} suffix="kcal" />
                </Card>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
            }}>
                <Card variant="outlined" className="weekly-summary-card">
                    <Statistic title="Calorie Deficiency" value={-300} precision={0} suffix="kcal" />
                </Card>
                <Card variant="outlined" className="weekly-summary-card">
                    <Statistic title="BMR" value={2016} precision={0} suffix="kcal" />
                </Card>
                <Card variant="outlined" className="weekly-summary-card">
                    <Statistic title="Macro adherence" value={85} precision={0} suffix="%" />
                </Card>

            </div>
        </div>
    )
}