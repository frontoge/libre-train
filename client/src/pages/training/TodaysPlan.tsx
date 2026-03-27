import PageLayout from '../../components/PageLayout';

export function TodaysPlan(props: any) {
	return (
		<PageLayout
			title="Training Plan Snapshot"
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: '2rem',
				gap: '2rem',
			}}
		></PageLayout>
	);
}
