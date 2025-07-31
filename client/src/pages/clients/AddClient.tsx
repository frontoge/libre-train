import Divider from "antd/es/divider";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { Button } from "antd";
import { useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { AddClientFormContext, type AddClientFormValues } from "../../contexts/AddClientFormContext";
import ClientFormInformation from "../../components/clients/ClientFormInformation";
import ClientFormGoals from "../../components/clients/ClientFormGoals";
import ClientMeasurements from "../../components/clients/ClientMeasurements";

export function AddClient() {

    const [formValues, setFormValues] = useState<AddClientFormValues>({
        information: {
            firstName: undefined,
            lastName: undefined,
            phone: undefined,
            email: undefined,
            height: undefined,
            age: undefined,
            img64: undefined
        },
        goals: {
            goal: undefined,
            targetWeight: undefined,
            targetBodyFat: undefined,
            targetLeanMass: undefined,
            targetDate: undefined
        },
        measurements: {
            wrist: undefined,
            calves: undefined,
            biceps: undefined,
            chest: undefined,
            thighs: undefined,
            waist: undefined,
            shoulders: undefined,
            hips: undefined,
            forearm: undefined,
            neck: undefined
        }
    })

    const resetFormValues = () => {
        setFormValues({
            information: {
                firstName: undefined,
                lastName: undefined,
                phone: undefined,
                email: undefined,
                height: undefined,
                age: undefined,
                img64: undefined
            },
            goals: {
                goal: undefined,
                targetWeight: undefined,
                targetBodyFat: undefined,
                targetLeanMass: undefined,
                targetDate: undefined
            },
            measurements: {
                wrist: undefined,
                calves: undefined,
                biceps: undefined,
                chest: undefined,
                thighs: undefined,
                waist: undefined,
                shoulders: undefined,
                hips: undefined,
                forearm: undefined,
                neck: undefined
            }
        })
    }

    const submitAddClientForm = () => {

    }

    return (
        <AddClientFormContext value={{formValues, setFormValues}}>
            <PageLayout title="Add Client" style={{
                    padding: "2rem 3rem",
                display: "flex",
                justifyContent: "center",
            }}>
                <Panel style={{
                    width: "60%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem 3rem",
                    alignItems: "center"
                }}>
                    <h2 style={{
                        marginTop: 0,
                        marginBottom: 0,
                        fontSize: '2rem',
                    }}>
                        Client Intake Form
                    </h2>
                    <Divider />
                    <div style={{
                        width: "100%",
                        display: 'flex',
                        height: '100%',
                    }}>
                        <div style={{
                            width: '50%',
                            height: '100%',
                        }}>
                            <ClientFormInformation />
                            <ClientFormGoals />
                        </div>
                        <div style={{
                            width: '50%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1rem',
                            gap: '1rem'
                        }}>
                            <ClientMeasurements />
                            <TextArea placeholder="Notes" maxLength={500} style={{ width: '100%', height: "20%" }} value={formValues.information.notes} onChange={(e) => setFormValues(prev => ({...prev, information: {...prev.information, notes: e.target.value}}))} />
                            <div style={{
                                flexGrow: 1,
                            }}>

                            </div>
                            <div style={{
                                    justifySelf: 'end',
                                    alignSelf: 'end',
                                    display: 'flex',
                                    gap: '1rem',
                                }}>
                                    <Button type="primary" onClick={submitAddClientForm}>
                                        Save
                                    </Button>
                                    <Button type="default" onClick={resetFormValues}>
                                        Clear
                                    </Button>
                                </div>
                        </div>
                    </div>
                </Panel>
            </PageLayout>
        </AddClientFormContext>
    );
}