import { useContext, useState, type JSX } from "react";
import { AssessmentTypeSelect } from "../../components/Assessments/AssessmentTypeSelect";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { ClientSearch } from "../../components/clients/ClientSearch";
import { CompositionAssessmentForm } from "../../components/Assessments/CompositionAssessmentForm";
import { AppContext } from "../../app-context";
import type { AssessmentFormValues } from "../../types/types";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";
import message from "antd/es/message";
import { AssessmentGroup } from "../../../../shared/models";


export function CreateAssessment() {
    const [messageApi, contextHolder] = message.useMessage();
    const { state: { assessmentTypes }} = useContext(AppContext);

    if (!assessmentTypes) {
        return <div>Loading...</div>
    }

    const [selectedClient, setSelectedClient] = useState<number | null>(null);
    const [assessmentType, setAssessmentType] = useState<number | null>(null);

    const selectedAssessmentType = assessmentTypes.find(type => type.id === assessmentType);

    const resetFields = () => {
        setSelectedClient(null);
        setAssessmentType(null);
    }

    const handleSubmit = async (result: AssessmentFormValues) => {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientId: selectedClient,
                assessments: [
                    {
                        assessmentTypeId: assessmentType,
                        assessmentDate: result.date?.format("YYYY-MM-DD"),
                        assessmentValue: result.result,
                        notes: result.notes,
                    }
                ]
            })
        };
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}`, requestOptions);
        if (response.ok) {
            // handle success, maybe show a message or redirect
            messageApi.success('Assessment log created successfully');
            resetFields();
        } else {
            // handle error, maybe show an error message
            messageApi.error('Failed to create assessment log');
            console.error('Failed to create assessment log');
        }
    }

    const assessmentForms: { [key in AssessmentGroup]?: JSX.Element } = {
        [AssessmentGroup.Composition]: (<CompositionAssessmentForm assessmentTypeId={assessmentType!} onSubmit={handleSubmit} />)
    }


    return (
        <>
            {contextHolder}
            <PageLayout title="New Assessment" style={{
                padding: "2rem 3rem",
                display: "flex",
                justifyContent: "center",
            }}>
                <Panel style={{
                    width: "50%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem 3rem",
                    alignItems: "center",
                }}>
                    <div style={{
                        display: 'flex',
                        width: "100%",
                        gap: '2rem',
                        justifyContent: 'start',
                    }}>
                        <ClientSearch 
                            style={{ width: "40%", marginBottom: "2rem" }}
                            onClientSelect={(clientId) => setSelectedClient(Number(clientId))}
                        />
                        <AssessmentTypeSelect 
                            style={{ width: "40%", marginBottom: "2rem" }}
                            onAssessmentTypeSelect={(typeId) => setAssessmentType(Number(typeId))}
                        />
                    </div>
                    { selectedClient && selectedAssessmentType &&
                        assessmentForms[selectedAssessmentType?.assessmentGroupId as AssessmentGroup]
                    }
                </Panel>
            </PageLayout>
        </>
    )
}