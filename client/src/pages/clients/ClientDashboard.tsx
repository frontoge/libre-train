import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchClientDashboardData } from '../../api/client';
import { AppContext } from '../../app-context';
import { ClientDataViewer } from '../../components/clients/ClientDataViewer';
import { ClientLists } from '../../components/clients/ClientLists';
import { ClientOverview } from '../../components/clients/ClientOverview';
import PageLayout, { type BreadcrumbItem } from '../../components/PageLayout';
import { ClientDashboardContext, defaultDashboardState, type DashboardState } from '../../contexts/ClientDashboardContext';
import { useMessage } from '../../hooks/useMessage';

export function ClientDashboard() {
	const { state, stateRefreshers } = useContext(AppContext);
	const [dashboardState, setDashboardState] = useState<DashboardState>(defaultDashboardState);
	const showMessage = useMessage();
	const { id } = useParams();

	const clientId = id ? parseInt(id, 10) : undefined;

	const selectedClient = useMemo(() => state.clients.find((client) => client.ClientId === clientId), [state.clients, id]);

	const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
		const trail: BreadcrumbItem[] = [{ label: 'Clients', to: '/clients/browse' }];
		if (selectedClient) {
			trail.push({ label: `${selectedClient.first_name} ${selectedClient.last_name}` });
		}
		return trail;
	}, [selectedClient]);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				if (selectedClient == undefined) {
					return;
				}

				const data = await fetchClientDashboardData({
					clientId: selectedClient.ClientId.toString(),
					date: dashboardState.selectedDate.format('YYYY-MM-DD'),
				});

				setDashboardState((prev) => ({
					...prev,
					data,
				}));
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
				showMessage('error', 'An error occurred while fetching dashboard data');
			}
		};
		if (state.clients.length === 0 || selectedClient === undefined) {
			stateRefreshers?.refreshClients();
			return;
		}

		fetchDashboardData();
	}, [selectedClient, dashboardState.selectedDate]);

	return (
		<ClientDashboardContext value={{ dashboardState, setDashboardState }}>
			<PageLayout
				title="Client Dashboard"
				breadcrumbs={breadcrumbs}
				contentStyle={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}
			>
				<div
					id="client-dash-left"
					style={{
						display: 'flex',
						gap: '2rem',
						flexDirection: 'column',
						width: '70%',
						padding: '2rem 2rem',
					}}
				>
					<ClientOverview selectedClient={selectedClient} />
					<ClientDataViewer />
				</div>
				<div
					id="client-dash-right"
					style={{
						width: '30%',
						padding: '2rem 2rem 2rem 1rem',
					}}
				>
					<ClientLists />
				</div>
			</PageLayout>
		</ClientDashboardContext>
	);
}
