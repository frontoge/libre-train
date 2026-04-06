import { Card, Col, Progress, Row, Space, theme, Typography } from 'antd';

interface DashboardHeaderProps {
	profileCompletion: number;
	clientsWithEmail: number;
	totalClients: number;
}

export function DashboardHeader({ profileCompletion, clientsWithEmail, totalClients }: DashboardHeaderProps) {
	const { token } = theme.useToken();

	return (
		<Card
			bordered={false}
			style={{
				background: `linear-gradient(135deg, ${token.colorPrimaryBgHover}, ${token.colorBgContainer})`,
				borderRadius: 20,
				border: `1px solid ${token.colorBorderSecondary}`,
			}}
		>
			<Row align="middle" justify="space-between" gutter={[20, 20]}>
				<Col xs={24} md={16}>
					<Space direction="vertical" size={10}>
						<Typography.Title level={2} style={{ margin: 0 }}>
							Your Coaching Command Center
						</Typography.Title>
						<Typography.Text type="secondary" style={{ fontSize: 15 }}>
							Track clients, monitor profile readiness, and move quickly between planning and execution.
						</Typography.Text>
					</Space>
				</Col>
				<Col xs={24} md={8}>
					<Card
						size="small"
						style={{
							borderRadius: 14,
							background: token.colorBgElevated,
							border: `1px solid ${token.colorBorderSecondary}`,
						}}
					>
						<Space direction="vertical" size={4} style={{ width: '100%' }}>
							<Typography.Text type="secondary">Profile Completeness</Typography.Text>
							<Progress
								percent={profileCompletion}
								strokeColor={token.colorPrimary}
								trailColor={token.colorFillTertiary}
								status="active"
							/>
							<Typography.Text type="secondary" style={{ fontSize: 12 }}>
								{clientsWithEmail} of {totalClients} client profiles include email contact data.
							</Typography.Text>
						</Space>
					</Card>
				</Col>
			</Row>
		</Card>
	);
}
