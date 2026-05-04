import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../app-context';
import {
	AssessmentHistoryFilters,
	type AssessmentHistorySearchQuery,
} from '../../components/Assessments/AssessmentHistoryFilters';
import { AssessmentHistoryTable, type AssessmentHistoryTableEntry } from '../../components/Assessments/AssessmentHistoryTable';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { fetchAssessmentLogs } from '../../api/assessment';
import { mapAssessmentLogToDataTableEntry } from '../../helpers/mappers';
import { useMessage } from '../../hooks/useMessage';

export function AssessmentHistory() {
	const {
		state: { clients, assessmentTypes },
	} = useContext(AppContext);
	const [tableData, setTableData] = useState<AssessmentHistoryTableEntry[]>([]);
	const [searchQuery, setSearchQuery] = useState<AssessmentHistorySearchQuery | undefined>(undefined);
	const showMessage = useMessage();

	const getNewClientLogData = async () => {
		try {
			if (!searchQuery) return;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { clientId, ...parameters } = searchQuery;

			const data = await fetchAssessmentLogs(parseInt(searchQuery.clientId, 10), parameters);

			const mappedData = data ? mapAssessmentLogToDataTableEntry(data, clients, assessmentTypes) : [];
			setTableData(mappedData);
		} catch (error) {
			console.error('Error fetching assessment history data:', error);
			showMessage('error', 'An error occurred while fetching assessment history data');
		}
	};

	useEffect(() => {
		getNewClientLogData();
	}, [searchQuery]);

	return (
		<PageLayout
			title="Assessment History"
			contentStyle={{
				padding: '2rem 3rem',
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Panel
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					padding: '1rem 3rem',
					gap: '1rem',
					justifyContent: 'center',
				}}
			>
				<AssessmentHistoryFilters
					style={{
						height: '10%',
						width: '100%',
					}}
					onUpdateSearchQuery={(values) => setSearchQuery(values)}
				/>
				<AssessmentHistoryTable
					style={{
						height: '90%',
						width: '100%',
					}}
					dataSource={tableData}
					onAction={getNewClientLogData}
				/>
			</Panel>
		</PageLayout>
	);
}
