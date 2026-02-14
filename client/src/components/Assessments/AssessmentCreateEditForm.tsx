import { useContext, useState, type JSX } from "react";
import { AppContext } from "../../app-context";
import message from "antd/es/message";
import type { AssessmentFormValues } from "../../types/types";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";
import { AssessmentGroup } from "../../../../shared/models";
import { CompositionAssessmentForm } from "./CompositionAssessmentForm";
import { ClientSearch } from "../clients/ClientSearch";
import { AssessmentTypeSelect } from "./AssessmentTypeSelect";

export type AssessmentCreateEditInitialValues = {
    assessment?: AssessmentFormValues;
    logId?: number;
    client?: {
        key?: string;
        label: React.ReactNode;
        value: string;
    };
    assessmentTypeId?: number;
}

export type AssessmentCreateEditFormProps = {
    isEdit?: boolean;
    onSubmit?: (values: AssessmentFormValues) => void;
    onCancel?: () => void;
    initialValues?: AssessmentCreateEditInitialValues;
}

export function AssessmentCreateEditForm(props: AssessmentCreateEditFormProps) {
    const [messageApi, contextHolder] = message.useMessage();
    const { state: { assessmentTypes }} = useContext(AppContext);

    if (!assessmentTypes) {
        return <div>Loading...</div>
    }

    const [selectedClient, setSelectedClient] = useState<number | null>(props.initialValues?.client?.value ? Number(props.initialValues.client.value) : null);
    const [assessmentType, setAssessmentType] = useState<number | null>(props.initialValues?.assessmentTypeId || null);

    const selectedAssessmentType = assessmentTypes.find(type => type.id === assessmentType);

    const resetFields = () => {
        setSelectedClient(null);
        setAssessmentType(null);
    }

    const createNewAssessmentRequest = async (result: AssessmentFormValues) => {
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

    const updateAssessmentRequest = async (result: AssessmentFormValues) => {
        if (!props.initialValues?.logId) {
            console.error("No log ID provided for update");
            return;
        }
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientId: selectedClient,
                assessmentTypeId: assessmentType,
                assessmentDate: result.date?.format("YYYY-MM-DD"),
                assessmentValue: result.result,
                notes: result.notes,
            })
        };
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}/${props.initialValues.logId}`, requestOptions);
        if (!response.ok) {
            messageApi.error('Failed to update assessment log');
            console.error('Failed to update assessment log');
            return
        }
        messageApi.success('Assessment log updated successfully');

    }

    const handleSubmit = (result: AssessmentFormValues) => {
        if (props.isEdit) {
            updateAssessmentRequest(result);
            props.onSubmit?.(result);
        } else {
            createNewAssessmentRequest(result);
            props.onSubmit?.(result);
        }
    }

    const assessmentForms: { [key in AssessmentGroup]?: JSX.Element } = {
        [AssessmentGroup.Composition]: (<CompositionAssessmentForm assessmentTypeId={assessmentType!} onSubmit={handleSubmit} initialValues={props.initialValues?.assessment} />)
    }

    return (
        <>
            {contextHolder}
            <div style={{
                display: 'flex',
                width: "100%",
                gap: '2rem',
                justifyContent: 'start',
            }}>
                <ClientSearch 
                    style={{ width: "40%", marginBottom: "2rem" }}
                    onClientSelect={(clientId) => setSelectedClient(Number(clientId))}
                    defaultValue={props.initialValues?.client ?? undefined}
                />
                <AssessmentTypeSelect 
                    style={{ width: "40%", marginBottom: "2rem" }}
                    onAssessmentTypeSelect={(typeId) => setAssessmentType(Number(typeId))}
                    value={assessmentType}
                />
            </div>
            { selectedClient && selectedAssessmentType &&
                assessmentForms[selectedAssessmentType?.assessmentGroupId as AssessmentGroup]
            }
        </>
    )
}