import { CalendarOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space, theme, Typography } from 'antd';

interface DashboardStatsProps {
	totalClients: number;
	totalExercises: number;
	totalAssessmentTypes: number;
}

export function DashboardStats({ totalClients, totalExercises, totalAssessmentTypes }: DashboardStatsProps) {
	const { token } = theme.useToken();

	return (
		<Row gutter={[16, 16]}>
			<Col xs={24} md={8}>
				<Card bordered={false} style={{ borderRadius: 16, height: '100%' }}>
					<Space direction="vertical" size={6}>
						<TeamOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
						<Typography.Text type="secondary">Active Clients</Typography.Text>
						<Typography.Title level={3} style={{ margin: 0 }}>
							{totalClients}
						</Typography.Title>
					</Space>
				</Card>
			</Col>
			<Col xs={24} md={8}>
				<Card bordered={false} style={{ borderRadius: 16, height: '100%' }}>
					<Space direction="vertical" size={6}>
						<RiseOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
						<Typography.Text type="secondary">Exercise Library</Typography.Text>
						<Typography.Title level={3} style={{ margin: 0 }}>
							{totalExercises}
						</Typography.Title>
					</Space>
				</Card>
			</Col>
			<Col xs={24} md={8}>
				<Card bordered={false} style={{ borderRadius: 16, height: '100%' }}>
					<Space direction="vertical" size={6}>
						<CalendarOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
						<Typography.Text type="secondary">Assessment Metrics</Typography.Text>
						<Typography.Title level={3} style={{ margin: 0 }}>
							{totalAssessmentTypes}
						</Typography.Title>
					</Space>
				</Card>
			</Col>
		</Row>
	);
}
