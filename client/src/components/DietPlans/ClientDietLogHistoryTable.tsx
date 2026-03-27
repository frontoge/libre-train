import { Table } from "antd";
import { useEffect, useState } from "react";
import type { DietPlanLogEntry } from "@libre-train/shared";
import { fetchDietPlanLogEntries } from "../../helpers/api";
import dayjs from "dayjs";

export interface ClientDietLogHistoryTableProps extends React.ComponentProps<typeof Table> {
    dietPlanId: number;
}

export function ClientDietLogHistoryTable(props: ClientDietLogHistoryTableProps) {
    const { dietPlanId, style, ...tableProps } = props;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [logEntries, setLogEntries] = useState<DietPlanLogEntry[]>([]);

    const fetchLogEntries = async () => {
        try {
            setIsLoading(true);
            const results = await fetchDietPlanLogEntries(dietPlanId);
            setLogEntries(results);
        } catch (error) {
            // show error notification
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (dietPlanId) {
            fetchLogEntries();
        }
    }, [dietPlanId]);

    const columns = [
        {
            title: 'Date',
            dataIndex: 'logDate',
            key: 'date',
            sorter: (a: DietPlanLogEntry, b: DietPlanLogEntry) => {
                const dateA = dayjs(a.logDate);
                const dateB = dayjs(b.logDate);
                if (dateA.isBefore(dateB)) return -1;
                if (dateA.isAfter(dateB)) return 1;
                return 0;
            }
        },
        {
            title: 'Calories',
            dataIndex: 'calories',
            key: 'calories',
        },
        {
            title: 'Protein (g)',
            dataIndex: 'protein',
            key: 'protein',
        },
        {
            title: 'Carbs (g)',
            dataIndex: 'carbs',
            key: 'carbs',
        },
        {
            title: 'Fats (g)',
            dataIndex: 'fats',
            key: 'fats',
        },
    ]


    return (
        <Table
            bordered
            loading={isLoading}
            columns={columns}
            dataSource={logEntries}
            style={{
                ...style,
            }}
            pagination={{ 
                pageSize: 10,
                showSizeChanger: false
            }}
            {...tableProps}
        >

        </Table>
    )
}