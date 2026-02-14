import { Button, Space, Table, type TableProps } from "antd";

export interface AssessmentHistoryTableProps extends React.ComponentProps<typeof Table>{
}

export type AssessmentHistoryTableEntry = {
    client_name: string;
    assessment_name: string;
    result: string;
    notes?: string;
    date: string;
}

export function AssessmentHistoryTable(props: AssessmentHistoryTableProps) {
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
                    <Button color="danger" variant="filled">Delete</Button>
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