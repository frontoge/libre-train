import { ClientDietPlanTable } from '../../components/DietPlans/ClientDietPlanTable';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';

export function DietPlanBrowse() {
	return (
		<PageLayout title="View Client Diet Plans">
			<Panel
				style={{
					width: '100%',
					height: '100%',
				}}
			>
				<ClientDietPlanTable />
			</Panel>
		</PageLayout>
	);
}
