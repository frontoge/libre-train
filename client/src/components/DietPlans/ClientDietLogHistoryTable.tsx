import type { DietPlanLogEntry } from '@libre-train/shared';
import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchDietPlanLogEntries } from '../../helpers/api';

export interface ClientDietLogHistoryTableProps extends TableProps<DietPlanLogEntry> {
	dietPlanId?: number;
}

export function ClientDietLogHistoryTable(props: ClientDietLogHistoryTableProps) {
	const { dietPlanId, style, ...tableProps } = props;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [logEntries, setLogEntries] = useState<DietPlanLogEntry[]>([]);

	const fetchLogEntries = async () => {
		if (!dietPlanId) return;
		try {
			setIsLoading(true);
			const results = await fetchDietPlanLogEntries(dietPlanId);
			setLogEntries(results);
		} catch (error) {
			// show error notification
			console.error('Failed to fetch diet plan log entries:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (dietPlanId) {
			fetchLogEntries();
		}
	}, [dietPlanId]);

	const columns: ColumnsType<DietPlanLogEntry> = [
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
			},
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
	];

	return (
		<Table<DietPlanLogEntry>
			bordered
			loading={isLoading}
			columns={columns}
			dataSource={logEntries}
			style={{
				...style,
			}}
			pagination={{
				pageSize: 10,
				showSizeChanger: false,
			}}
			{...tableProps}
		></Table>
	);
}
