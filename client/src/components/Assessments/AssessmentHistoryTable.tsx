import { Button, Popconfirm, Space, Table, type TableProps } from "antd";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";
import { useState } from "react";
import { AssessmentModal } from "./AssessmentModal";
import type { AssessmentCreateEditInitialValues } from "./AssessmentCreateEditForm";
import dayjs from "dayjs";

export interface AssessmentHistoryTableProps extends React.ComponentProps<typeof Table>{
    onAction?: () => void;
}

export type AssessmentHistoryTableEntry = {
    id: string;
    client_id: string;
    client_name: string;
    assessment_type_id: string;
    assessment_name: string;
    result: string;
    resultUnits: string;
    notes?: string;
    date: string;
}

export function AssessmentHistoryTable(props: AssessmentHistoryTableProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [initialFormValues, setInitialFormValues] = useState<AssessmentCreateEditInitialValues | undefined>(undefined);

    const handleDeleteEntry = async (entryId: string) => {
        // Make delete request to backend to delete the assessment log entry
        try {
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }

            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}/${entryId}`, requestOptions);

            if (!response.ok) {
                throw new Error('Failed to delete assessment log entry');
            }
            props.onAction?.();
        } catch (error) {
            console.error('Error deleting assessment log entry:', error);
        }
    }

    const handleEditEntry = (entry: AssessmentHistoryTableEntry) => {
        setInitialFormValues({
            logId: Number(entry.id),
            assessment: {
                result: entry.result,
                notes: entry.notes,
                date: dayjs(entry.date),
            },
            client: {
                key: entry.client_id,
                label: entry.client_name,
                value: entry.client_id,
            },
            assessmentTypeId: parseInt(entry.assessment_type_id),
        });
        setShowEditModal(true);
    }

    const handleSubmitEditModalClose = () => {
        setTimeout(() => {
            setShowEditModal(false);
            setInitialFormValues(undefined);
            props.onAction?.();
        }, 1500)
    }

    const historyTableColumns: TableProps<AssessmentHistoryTableEntry>['columns'] = [
        {
            title: 'Client Name',
            dataIndex: 'client_name',
            key: 'client_name',
            width: 250,
        },
        {
            title: 'Assessment',
            dataIndex: 'assessment_name',
            key: 'assessment_name',
            width: 250,
        },
        {
            title: 'Result',
            dataIndex: 'result',
            key: 'result',
            width: 100,
            render: (value, record) => `${value} ${record.resultUnits}`
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 150,
        },
        {
            title: 'Actions',
            width: 200,
            render: (_, record) => (
                <Space size='middle'>
                    <Button type="link" onClick={() => handleEditEntry(record)}>Edit</Button>
                    <Popconfirm
                        title="Delete Assessment log"
                        description="Are you sure you want to delete this assessment log? This action cannot be undone."
                        okText="Yes"
                        cancelText="No"
                        placement="topRight"
                        onConfirm={() => handleDeleteEntry(record.id)}
                    >
                        <Button color="danger" variant="filled">Delete</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    return (
        <>
            <Table 
                pagination={{ 
                    pageSize: 9,
                    showSizeChanger: false
                }}
                columns={historyTableColumns}
                {...props}
            >

            </Table>
            {showEditModal &&
                <AssessmentModal
                    open={showEditModal}
                    onCancel={() => setShowEditModal(false)}
                    isEdit={true}
                    title="Edit Assessment Log"
                    initialValues={initialFormValues}
                    onSubmit={handleSubmitEditModalClose}
                />
            }
        </>
    )
}