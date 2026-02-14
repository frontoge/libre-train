import { Button, Popconfirm, Space, Table, type TableProps } from "antd";
import { method } from "lodash";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";

export interface AssessmentHistoryTableProps extends React.ComponentProps<typeof Table>{
    onAction?: () => void;
}

export type AssessmentHistoryTableEntry = {
    id: string;
    client_name: string;
    assessment_name: string;
    result: string;
    notes?: string;
    date: string;
}

export function AssessmentHistoryTable(props: AssessmentHistoryTableProps) {

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
                    <Button type="link">Edit</Button>
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
        <Table 
            pagination={{ 
                pageSize: 9,
                showSizeChanger: false
            }}
            columns={historyTableColumns}
            {...props}
        >

        </Table>
    )
}