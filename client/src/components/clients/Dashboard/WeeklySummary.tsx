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

import { Alert, Card, DatePicker, Statistic } from "antd";
import "../../../styles/ClientDashboard/weekly-summary.css";
import { Dayjs } from "dayjs";
import React from "react";
import { getWeekRange } from "../../../helpers/date-helpers";
import { getAppConfiguration } from "../../../config/app.config";
import { Routes } from "../../../../../shared/routes";
import { useParams } from "react-router-dom";
import type { DashboardWeeklySummaryResponse } from "../../../../../shared/types";
import { type DashboardSummaryState } from "../../../types/types";
import { mapDashboardSummaryResponse } from "../../../helpers/client-mappers";
import { formatStatisticDiff, getStatisticPrefix } from "../../../helpers/client-formatters";


export function WeeklySummary() {

    const { id } = useParams();
    const [selectedWeek, setSelectedWeek] = React.useState<Dayjs | undefined>(undefined);
    const [summaryState, setSummaryState] = React.useState<DashboardSummaryState | undefined>(undefined);


    React.useEffect(() => {
        const getSummaryData = async () => {
            if (!selectedWeek) {
                return;
            }
            const weekRange = getWeekRange(selectedWeek);
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/dashboard/summary?startDate=${weekRange.start}&endDate=${weekRange.end}&clientId=${id}`, requestOptions);

            const data: DashboardWeeklySummaryResponse = await response.json();

            if ('message' in data) {
                console.error(data.message);
                return;
            }

            setSummaryState(mapDashboardSummaryResponse(data));
        }

        getSummaryData();
    }, [selectedWeek, id])

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
            { selectedWeek === undefined || id === undefined ?
            <div style={{
                width: "100%",
                height: "100%",
            }}>
               <Alert message="Please select a week and client to view the summary." type="info" />
            </div>
            :
            <>
                <div className="summary-statistics" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1rem',
                }}>
                    <Card variant="outlined" className="weekly-summary-card">
                        <Statistic title="Weight" value={summaryState?.weight} precision={1} suffix={`lbs ${formatStatisticDiff(summaryState?.weightDiff, 1)}`} />
                    </Card>
                    <Card variant="outlined" className="weekly-summary-card">
                        <Statistic title="Body Fat" value={summaryState?.bodyFat} precision={1} suffix={`% ${formatStatisticDiff(summaryState?.bodyFatDiff, 1)}`} />
                    </Card>
                    <Card variant="outlined" className="weekly-summary-card">
                        <Statistic title="Lean Mass" value={summaryState?.leanMass} precision={1} suffix={`lbs ${formatStatisticDiff(summaryState?.leanMassDiff, 1)}`} />
                    </Card>
                    <Card variant="outlined" className="weekly-summary-card">
                        <Statistic title="Calories" value={summaryState?.calories} precision={0} suffix={`kcal ${formatStatisticDiff(summaryState?.caloriesDiff)}`} />
                    </Card>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1rem',
                }}>
                    <Card variant="outlined" className="weekly-summary-card">
                        <Statistic title="Calorie Deficiency" value={summaryState?.calorieDeficiency} precision={0} suffix="kcal" />
                    </Card>
                    <Card variant="outlined" className="weekly-summary-card">
                        <Statistic title="BMR" value={summaryState?.bmr} precision={0} suffix="kcal" />
                    </Card>
                    <Card variant="outlined" className="weekly-summary-card">
                        <Statistic title="Macro adherence" value={summaryState?.macroAdherence} precision={0} suffix="%" />
                    </Card>

                </div>
            </>
            }
        </div>
    )
}