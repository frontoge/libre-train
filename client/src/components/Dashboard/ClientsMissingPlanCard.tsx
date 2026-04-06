import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, List, Space, Tag, theme, Typography } from 'antd';
import type { TrainingPlanStatus } from '../../types/types';

interface ClientsMissingPlanCardProps {
	clients: TrainingPlanStatus[];
	onCreatePlan: (clientName: string) => void;
	onNotifyClient: (clientName: string) => void;
}

export function ClientsMissingPlanCard({ clients, onCreatePlan, onNotifyClient }: ClientsMissingPlanCardProps) {
	const { token } = theme.useToken();

	return (
		<Card
			variant="borderless"
			title="Clients Missing Training Plan"
			extra={<Tag color="red">{clients.length} Unprogrammed</Tag>}
			style={{ borderRadius: 16, height: '100%' }}
		>
			{clients.length === 0 ? (
				<Typography.Text type="secondary">All clients have active programming.</Typography.Text>
			) : (
				<List
					dataSource={clients}
					renderItem={(client) => (
						<List.Item
							key={client.id}
							actions={[
								<Button key="create-plan" type="link" onClick={() => onCreatePlan(client.clientName)}>
									Create Plan
								</Button>,
								<Button key="notify-client" type="link" onClick={() => onNotifyClient(client.clientName)}>
									Notify
								</Button>,
							]}
						>
							<List.Item.Meta
								avatar={<ExclamationCircleOutlined style={{ color: token.colorError }} />}
								title={client.clientName}
								description={
									<Space orientation="vertical" size={2}>
										<Typography.Text type="secondary">Status: No active plan</Typography.Text>
										<Tag color={client.priority === 'high' ? 'red' : 'default'}>
											{client.priority === 'high' ? 'HIGH PRIORITY' : 'NORMAL PRIORITY'}
										</Tag>
									</Space>
								}
							/>
						</List.Item>
					)}
				/>
			)}
		</Card>
	);
}
