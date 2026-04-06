import { Card, Col, Progress, Row, Space, theme, Typography } from 'antd';

interface DashboardHeaderProps {
	taskProgressPercent: number;
	clientsWithTasksRemaining: number;
	totalClients: number;
}

export function DashboardHeader({ taskProgressPercent, clientsWithTasksRemaining, totalClients }: DashboardHeaderProps) {
	const { token } = theme.useToken();

	const progressColor =
		taskProgressPercent === 100 ? token.colorSuccess : taskProgressPercent >= 50 ? token.colorWarning : token.colorError;

	const headerBgColor =
		taskProgressPercent === 100
			? token.colorSuccessBg
			: taskProgressPercent >= 50
				? token.colorWarningActive
				: token.colorErrorBgActive;

	return (
		<Card
			variant="borderless"
			style={{
				background: `linear-gradient(135deg, ${headerBgColor}, ${token.colorBgContainer})`,
				borderRadius: 20,
				border: `1px solid ${token.colorBorderSecondary}`,
			}}
		>
			<Row align="middle" justify="space-between" gutter={[20, 20]}>
				<Col xs={24} md={16}>
					<Space orientation="vertical" size={10}>
						<Typography.Title level={2} style={{ margin: 0 }}>
							Your Coaching Command Center
						</Typography.Title>
						<Typography.Text type="secondary" style={{ fontSize: 15 }}>
							Track clients, monitor outstanding tasks, and move quickly between planning and execution.
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
						<Space orientation="vertical" size={4} style={{ width: '100%' }}>
							<Typography.Text type="secondary">Client Task Completion</Typography.Text>
							<Progress
								percent={taskProgressPercent}
								strokeColor={progressColor}
								railColor={token.colorFillTertiary}
								status={taskProgressPercent === 100 ? 'success' : 'active'}
							/>
							<Typography.Text type="secondary" style={{ fontSize: 12 }}>
								{clientsWithTasksRemaining} of {totalClients} clients still need follow-up action.
							</Typography.Text>
						</Space>
					</Card>
				</Col>
			</Row>
		</Card>
	);
}
