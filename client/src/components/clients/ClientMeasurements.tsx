import { InputNumber } from "antd"
import React from "react";
import { AddClientFormContext} from "../../contexts/AddClientFormContext";

export default function ClientMeasurements() {

    const { formValues, setFormValues } = React.useContext(AddClientFormContext);

    return (
        <>
            <h3 style={{
                margin: 0,
                alignSelf: 'center',
                fontSize: '1.5rem',
            }}>
                Measurements
            </h3>
            <div style={{
                width: "100%",
                height: '50%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'repeat(6, 1fr)',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <InputNumber 
                    placeholder="Weight" 
                    style={{ width: '100%' }}
                    min={0} 
                    suffix={"lbs"}
                    value={formValues.measurements.weight} 
                    onChange={(val) => 
                        setFormValues(prev => 
                            ({...prev, measurements: {...prev.measurements, weight: val === null ? undefined : val}})
                        )
                    }
                />
                <InputNumber
                    placeholder="Body Fat"
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    suffix={"%"}
                    value={formValues.measurements.body_fat}
                    onChange={(val) => 
                        setFormValues(prev => 
                            ({...prev, measurements: {...prev.measurements, body_fat: val === null ? undefined : val}})
                        )
                    }
                />
                <InputNumber 
                    placeholder="Wrist" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.wrist} 
                    onChange={(val) => 
                        setFormValues(prev => 
                            ({...prev,  measurements: {...prev.measurements, wrist: val === null ? undefined : val}})
                        )
                    } 
                />
                <InputNumber 
                    placeholder="Calves"
                    style={{ width: '100%' }}
                    min={0}
                    suffix={"in"}
                    value={formValues.measurements.calves}
                    onChange={(val) => 
                        setFormValues(prev => 
                            ({...prev,  measurements: {...prev.measurements, calves: val === null ? undefined : val}})
                        )
                    } 
                />
                <InputNumber 
                    placeholder="Biceps" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.biceps}
                    onChange={(val) => 
                        setFormValues(prev => 
                            ({...prev,  measurements: {...prev.measurements, biceps: val === null ? undefined : val}})
                        )
                    } 
                />
                <InputNumber 
                    placeholder="Chest" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.chest}
                    onChange={(val) => setFormValues(prev => ({...prev, measurements: {...prev.measurements, chest: val === null ? undefined : val}}))} />
                <InputNumber 
                    placeholder="Thighs" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.thighs}
                    onChange={(val) => setFormValues(prev => ({...prev, measurements: {...prev.measurements, thighs: val === null ? undefined : val}}))} />
                <InputNumber 
                    placeholder="Waist" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"} 
                    value={formValues.measurements.waist}
                    onChange={(val) => setFormValues(prev => ({...prev, measurements: {...prev.measurements, waist: val === null ? undefined : val}}))} />
                <InputNumber 
                    placeholder="Shoulders" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.shoulders}
                    onChange={(val) => setFormValues(prev => ({...prev, measurements: {...prev.measurements, shoulders: val === null ? undefined : val}}))} />
                <InputNumber 
                    placeholder="Hips" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.hips}
                    onChange={(val) => setFormValues(prev => ({...prev, measurements: {...prev.measurements, hips: val === null ? undefined : val}}))} />
                <InputNumber 
                    placeholder="Forearm" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.forearm}
                    onChange={(val) => setFormValues(prev => ({...prev, measurements: {...prev.measurements, forearm: val === null ? undefined : val}}))} />
                <InputNumber 
                    placeholder="Neck" 
                    style={{ width: '100%' }} 
                    min={0} 
                    suffix={"in"}
                    value={formValues.measurements.neck}
                    onChange={(val) => setFormValues(prev => ({...prev, measurements: {...prev.measurements, neck: val === null ? undefined : val}}))} />
            </div>
        </>
    );
}
