import PageLayout from '../../components/PageLayout';

export function TodaysPlan() {
	return (
		<PageLayout
			title="Training Plan Snapshot"
			contentStyle={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: '2rem',
				gap: '2rem',
			}}
		></PageLayout>
	);
}
