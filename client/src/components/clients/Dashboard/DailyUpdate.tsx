import { Calendar, InputNumber, Divider, Card, Statistic, Button, message } from "antd";
import { NutritionSummary } from "../../Nutrition/NutritionSummary";
import { ClientDashboardContext } from "../../../contexts/ClientDashboardContext";
import React from "react";
import { type DailyUpdateData } from "../../../../../shared/types";
import { undefinedIfNull } from "../../../helpers/boolean-helpers";
import { useParams } from "react-router-dom";
import { getAppConfiguration } from "../../../config/app.config";
import { Routes } from "../../../../../shared/routes";
import dayjs from "dayjs";

export function DailyUpdate() {

    const { dashboardState, setDashboardState } = React.useContext(ClientDashboardContext);
    const { id } = useParams();
    const [dailyData, setDailyData] = React.useState<DailyUpdateData>({
        weight: dashboardState.data.logged_weight,
        body_fat: dashboardState.data.logged_body_fat,
        calories: dashboardState.data.logged_calories,
        target_calories: dashboardState.data.target_calories,
        protein: dashboardState.data.logged_protein,
        target_protein: dashboardState.data.target_protein,
        carbs: dashboardState.data.logged_carbs,
        target_carbs: dashboardState.data.target_carbs,
        fats: dashboardState.data.logged_fats,
        target_fats: dashboardState.data.target_fats,
    });
    const [messageApi, contextHolder] = message.useMessage();


    const clearDailyValues = () => {
        setDailyData({
            weight: undefined,
            body_fat: undefined,
            calories: undefined,
            target_calories: undefined,
            protein: undefined,
            target_protein: undefined,
            carbs: undefined,
            target_carbs: undefined,
            fats: undefined,
            target_fats: undefined,   
        });
    }

    const submitDailyUpdate = async () => {
        if (!dashboardState.selectedDate) {
            return;
        }
        if (!id) {
            messageApi.error("Must select a client");
            return;
        }
        dashboardState.setIsLoading(true);
        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: parseInt(id ?? "0"), // Ensure id is a number
                    date: dashboardState.selectedDate.format('YYYY-MM-DD'),
                    data: dailyData
                })
            };
            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/daily-update`, requestOptions);
            if (!response.ok) {
                messageApi.error('Failed to submit daily update.');
                throw new Error('Failed to submit daily update');
            }
            setDashboardState(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    logged_weight: dailyData.weight ?? prev.data.logged_weight,
                    logged_body_fat: dailyData.body_fat ?? prev.data.logged_body_fat,
                    logged_calories: dailyData.calories ?? prev.data.logged_calories,
                    target_calories: dailyData.target_calories ?? prev.data.target_calories,
                    logged_protein: dailyData.protein ?? prev.data.logged_protein,
                    target_protein: dailyData.target_protein ?? prev.data.target_protein,
                    logged_carbs: dailyData.carbs ?? prev.data.logged_carbs,
                    target_carbs: dailyData.target_carbs ?? prev.data.target_carbs,
                    logged_fats: dailyData.fats ?? prev.data.logged_fats,
                    target_fats: dailyData.target_fats ?? prev.data.target_fats,
                }
            }))
            clearDailyValues();
        } catch (error) {
            messageApi.error('An error occurred while submitting daily update.');
            console.error("Error submitting daily update:", error);
        } finally {
            dashboardState.setIsLoading(false);
        }
    }

    return (
        <>
            {contextHolder}
            <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    gap: '2rem',
                    height: '90%',
                }}>
                <div style={{
                    width: "40%",
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{
                        display: 'flex',
                    }}>
                        <Calendar fullscreen={false} value={dashboardState.selectedDate} onSelect={date => setDashboardState(prev => ({ ...prev, selectedDate: date }))} />
                    </div>
                    <div style={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <div className='update-inputs' style={{
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gridTemplateRows: 'repeat(7, 1fr)',
                            alignItems: 'center',
                            gap: '0.6rem',
                        }}>
                            <InputNumber placeholder="Weight" style={{ width: '100%' }} min={0} suffix={"lbs"} value={dailyData.weight} onChange={(val) => setDailyData({ ...dailyData, weight: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Body Fat" style={{ width: '100%' }} min={0} max={100} suffix={"%"} value={dailyData.body_fat} onChange={(val) => setDailyData({ ...dailyData, body_fat: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Calories" style={{ width: '100%' }} min={0} suffix={"kcal"} value={dailyData.calories} onChange={(val) => setDailyData({ ...dailyData, calories: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Target Calories" style={{ width: '100%' }} min={0} suffix={"kcal"} value={dailyData.target_calories} onChange={(val) => setDailyData({ ...dailyData, target_calories: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Protein" style={{ width: '100%' }} min={0} suffix={"g"} value={dailyData.protein} onChange={(val) => setDailyData({ ...dailyData, protein: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Target Protein" style={{ width: '100%' }} min={0} suffix={"g"} value={dailyData.target_protein} onChange={(val) => setDailyData({ ...dailyData, target_protein: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Carbs" style={{ width: '100%' }} min={0} suffix={"g"} value={dailyData.carbs} onChange={(val) => setDailyData({ ...dailyData, carbs: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Target Carbs" style={{ width: '100%' }} min={0} suffix={"g"} value={dailyData.target_carbs} onChange={(val) => setDailyData({ ...dailyData, target_carbs: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Fats" style={{ width: '100%' }} min={0} suffix={"g"} value={dailyData.fats} onChange={(val) => setDailyData({ ...dailyData, fats: undefinedIfNull(val) })} />
                            <InputNumber placeholder="Target Fats" style={{ width: '100%' }} min={0} suffix={"g"} value={dailyData.target_fats} onChange={(val) => setDailyData({ ...dailyData, target_fats: undefinedIfNull(val) })} />
                        </div>
                        
                    </div>
                </div>
                <div style={{
                    width: "60%",
                    height: "100%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <h1 style={{
                        marginBottom: '0',
                    }}>
                        {dashboardState.selectedDate?.format('MM/DD/YYYY') ?? dayjs().format('MM/DD/YYYY')}
                    </h1>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: '2rem',
                        width: '75%',
                        fontSize: '1.2rem',
                    }}>
                        <span>Phase 2</span>
                        <span>Bulking</span>
                    </div>
                    <Divider style={{margin: '0'}}/>
                    <div className="client-statistics" style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: '100%',
                        gap: '1rem',
                        justifyContent: 'space-around',
                    }}>
                        <Card variant="outlined" style={{
                            width: "40%"
                        }}>
                            <Statistic
                                title="Weight"
                                value={dashboardState.data.logged_weight ?? 0}
                                precision={1}
                                // suffix="(+2.3)"
                                // valueStyle={{ color: '#3f8600' }}
                                // prefix={<ArrowUpOutlined />}
                            />
                        </Card>
                        <Card variant="outlined" style={{
                            width: "40%"
                        }}>
                            <Statistic
                                title="Calories"
                                value={dashboardState.data.logged_calories ?? 0}
                                precision={0}
                                // suffix="(-144)"
                                // valueStyle={{ color: '#cf1322' }}
                                // prefix={<ArrowDownOutlined />}
                            />
                        </Card>
                    </div>
                    <Divider style={{ margin: '0.5rem 0' }} />
                    <NutritionSummary />
                    <div className='update-actions' style={{
                        height: "15%",
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: "end",
                        alignItems: 'end',
                        gap: '1rem',
                        width: '100%',
                    }}>
                        <Button type="primary" onClick={submitDailyUpdate}>
                            Save
                        </Button>
                        <Button type="default" onClick={clearDailyValues}>
                            Clear
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}