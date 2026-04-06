import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

interface Action {
	title: string;
	description: string;
	cta: string;
	path: string;
	icon: React.ReactNode;
}

interface QuickActionsCardProps {
	actions: Action[];
}

export function QuickActionsCard({ actions }: QuickActionsCardProps) {
	const navigate = useNavigate();

	return (
		<Card bordered={false} title="Quick Actions" style={{ borderRadius: 16 }}>
			<Space direction="vertical" size={12} style={{ width: '100%' }}>
				{actions.map((action) => (
					<Card
						key={action.title}
						size="small"
						style={{
							background: 'var(--ant-color-bg-elevated)',
							borderRadius: 12,
							border: '1px solid var(--ant-color-border-secondary)',
						}}
					>
						<Space direction="vertical" size={6} style={{ width: '100%' }}>
							<Space>
								<Tag color="green" style={{ marginInlineEnd: 0 }}>
									{action.icon}
								</Tag>
								<Typography.Text strong>{action.title}</Typography.Text>
							</Space>
							<Typography.Text type="secondary">{action.description}</Typography.Text>
							<Button type="link" onClick={() => navigate(action.path)} style={{ paddingInline: 0 }}>
								{action.cta} <ArrowRightOutlined />
							</Button>
						</Space>
					</Card>
				))}
			</Space>
		</Card>
	);
}
