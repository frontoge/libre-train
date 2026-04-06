import { CheckCircleOutlined, ClockCircleOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, List, Space, Tag, theme, Typography } from 'antd';

interface Appointment {
	id: number;
	clientName: string;
	time: string;
	focus: string;
	status: 'confirmed' | 'pending';
}

interface TodaysAppointmentsCardProps {
	appointments: Appointment[];
	onMarkComplete: (clientName: string) => void;
	onSendReminder: (clientName: string) => void;
}

export function TodaysAppointmentsCard({ appointments, onMarkComplete, onSendReminder }: TodaysAppointmentsCardProps) {
	const { token } = theme.useToken();

	return (
		<Card bordered={false} title="Today's Appointments" style={{ borderRadius: 16, height: '100%' }}>
			<List
				dataSource={appointments}
				renderItem={(appointment) => (
					<List.Item
						key={appointment.id}
						actions={[
							<Button
								key="mark-complete"
								type="link"
								icon={<CheckCircleOutlined />}
								onClick={() => onMarkComplete(appointment.clientName)}
							>
								Complete
							</Button>,
							<Button
								key="send-reminder"
								type="link"
								icon={<MailOutlined />}
								onClick={() => onSendReminder(appointment.clientName)}
							>
								Reminder
							</Button>,
						]}
					>
						<List.Item.Meta
							avatar={<ClockCircleOutlined style={{ color: token.colorPrimary }} />}
							title={appointment.clientName}
							description={
								<Space direction="vertical" size={2}>
									<Typography.Text type="secondary">{appointment.time}</Typography.Text>
									<Typography.Text type="secondary">{appointment.focus}</Typography.Text>
									<Tag color={appointment.status === 'confirmed' ? 'green' : 'gold'}>
										{appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
									</Tag>
								</Space>
							}
						/>
					</List.Item>
				)}
			/>
		</Card>
	);
}
