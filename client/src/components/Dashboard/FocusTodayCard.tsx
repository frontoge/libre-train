import { Card, Space, Typography } from 'antd';

export function FocusTodayCard() {
	return (
		<Card bordered={false} style={{ borderRadius: 16 }}>
			<Space direction="vertical" size={4}>
				<Typography.Text type="secondary">Focus Today</Typography.Text>
				<Typography.Title level={4} style={{ margin: 0 }}>
					Keep client plans and logs current
				</Typography.Title>
				<Typography.Text type="secondary">
					A quick daily update across assessments, routines, and nutrition logs improves coaching quality and client
					retention.
				</Typography.Text>
			</Space>
		</Card>
	);
}
