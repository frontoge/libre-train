import { Button, Calendar, Card, Divider, InputNumber, Spin, Statistic} from "antd";
import { Panel } from "../Panel";
import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { NutritionSummary } from "../Nutrition/NutritionSummary";

export function ClientDataViewer() {

    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);

    if (isLoading) {
        return (
            <Panel id="client-dash-data-viewer" style={{
                height: '80%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Spin size="large" tip="Loading client data..." />
            </Panel>
        )
    }

    return (
        <Panel id="client-dash-data-viewer" style={{
            height: '80%',
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem'
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
                    <Calendar fullscreen={false} onSelect={setSelectedDate} />
                </div>
                <Divider style={{ margin: '0' }}>
                    Input Daily Data
                </Divider>
                <div style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div className='update-inputs' style={{
                        height: "75%",
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: 'repeat(3, 1fr)',
                        alignItems: 'center',
                        gap: '1rem',
                    }}>
                        <InputNumber placeholder="Weight" style={{ width: '100%' }} min={0} suffix={"lbs"} />
                        <InputNumber placeholder="Body Fat" style={{ width: '100%' }} min={0} max={100} suffix={"%"} />
                        <InputNumber placeholder="Calories" style={{ width: '100%' }} min={0} suffix={"kcal"} />
                        <InputNumber placeholder="Protein" style={{ width: '100%' }} min={0} suffix={"g"} />
                        <InputNumber placeholder="Carbs" style={{ width: '100%' }} min={0} suffix={"g"} />
                        <InputNumber placeholder="Fats" style={{ width: '100%' }} min={0} suffix={"g"} />
                    </div>
                    <div className='update-actions' style={{
                        height: "25%",
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: "end",
                        alignItems: 'end',
                        gap: '1rem',
                        width: '100%',
                        paddingBottom: '1rem'
                    }}>
                        <Button type="primary">
                            Save
                        </Button>
                        <Button type="default">
                            Clear
                        </Button>
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
                    {selectedDate?.format('MM/DD/YYYY') ?? dayjs().format('MM/DD/YYYY')}
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
                <Divider style={{margin: '0.5rem'}}/>
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
                            value={180}
                            precision={1}
                            suffix="(+2.3)"
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Card>
                    <Card variant="outlined" style={{
                        width: "40%"
                    }}>
                        <Statistic
                            title="Calories"
                            value={2876}
                            precision={0}
                            suffix="(-144)"
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Card>
                </div>
                <Divider style={{ margin: '1rem 0' }} />
                <NutritionSummary />
            </div>
            
        </Panel>
    );
}