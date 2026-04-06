import { AlertOutlined } from '@ant-design/icons';
import { Button, Card, List, Space, Tag, Typography } from 'antd';

interface CheckIn {
	id: number;
	clientName: string;
	lastCheckIn: string;
	note: string;
	risk: 'low' | 'medium' | 'high';
}

interface CheckInsCardProps {
	checkIns: CheckIn[];
	orderByRisk?: boolean;
	onFollowUp: (clientName: string) => void;
}

export function CheckInsCard({ checkIns, orderByRisk = true, onFollowUp }: CheckInsCardProps) {
	const sortedCheckIns = orderByRisk
		? [...checkIns].sort((a, b) => {
				const riskLevels = { high: 3, medium: 2, low: 1 };
				return riskLevels[b.risk] - riskLevels[a.risk];
			})
		: checkIns;

	return (
		<Card variant="borderless" title="Check-ins Needing Attention" style={{ borderRadius: 16, height: '100%' }}>
			<List
				dataSource={sortedCheckIns}
				renderItem={(checkIn) => {
					const riskColor = checkIn.risk === 'high' ? 'red' : checkIn.risk === 'medium' ? 'gold' : 'green';
					return (
						<List.Item
							key={checkIn.id}
							actions={[
								<Button key="follow-up" type="link" onClick={() => onFollowUp(checkIn.clientName)}>
									Follow-up
								</Button>,
							]}
						>
							<List.Item.Meta
								avatar={<AlertOutlined style={{ color: riskColor }} />}
								title={checkIn.clientName}
								description={
									<Space orientation="vertical" size={2}>
										<Typography.Text type="secondary">Last update: {checkIn.lastCheckIn}</Typography.Text>
										<Typography.Text type="secondary">{checkIn.note}</Typography.Text>
										<Tag color={riskColor}>{checkIn.risk.toUpperCase()} PRIORITY</Tag>
									</Space>
								}
							/>
						</List.Item>
					);
				}}
			/>
		</Card>
	);
}
