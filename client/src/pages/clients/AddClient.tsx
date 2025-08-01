import Divider from "antd/es/divider";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { Button, message } from "antd";
import { useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { AddClientFormContext, defaultFormValues } from "../../contexts/AddClientFormContext";
import ClientFormInformation from "../../components/clients/ClientFormInformation";
import ClientFormGoals from "../../components/clients/ClientFormGoals";
import ClientMeasurements from "../../components/clients/ClientMeasurements";
import { type AddClientFormValues } from "../../../../shared/types";
import { Routes } from "../../../../shared/routes";
import { getAppConfiguration } from "../../config/app.config";

export function AddClient() {

    const [messageApi, contextHolder] = message.useMessage();
    const [formValues, setFormValues] = useState<AddClientFormValues>(defaultFormValues);

    const resetFormValues = () => {
        setFormValues(defaultFormValues)
    }

    const submitAddClientForm = async () => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formValues)
        }
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}`, requestOptions);
        if (!response.ok) {
            messageApi.error('Failed to add client.');
            return;
        }
        const data = await response.json();
        messageApi.success('Client added successfully.');
        resetFormValues();
    }

    return (
        <AddClientFormContext value={{formValues, setFormValues}}>
            <>
            {contextHolder}
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
            </>
        </AddClientFormContext>
    );
}