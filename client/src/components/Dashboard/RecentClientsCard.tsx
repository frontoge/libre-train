import type { ClientContact } from '@libre-train/shared';
import { Avatar, Button, Card, Divider, List, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '../../helpers/label-formatters';

interface RecentClientsCardProps {
	clients: ClientContact[];
	onMessage: (clientName: string) => void;
}

const getReadableDate = (date: Date | string | undefined) => {
	if (!date) {
		return 'No date';
	}

	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) {
		return 'No date';
	}

	return parsed.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export function RecentClientsCard({ clients, onMessage }: RecentClientsCardProps) {
	const navigate = useNavigate();

	return (
		<Card variant={'borderless'} title="Recently Added Clients" style={{ borderRadius: 16, height: '100%' }}>
			{clients.length === 0 ? (
				<Typography.Text type="secondary">No clients yet. Start by creating your first client profile.</Typography.Text>
			) : (
				<List
					dataSource={clients}
					renderItem={(client) => (
						<List.Item
							actions={[
								<Button key="view-client-dashboard" type="link" onClick={() => navigate('/clients/')}>
									View Dashboard
								</Button>,
								<Button
									key="message-client"
									type="link"
									onClick={() => onMessage(`${client.first_name} ${client.last_name}`)}
								>
									Message
								</Button>,
							]}
						>
							<List.Item.Meta
								avatar={<Avatar>{getInitials(client.first_name, client.last_name)}</Avatar>}
								title={`${client.first_name} ${client.last_name}`}
								description={
									<Space separator={<Divider orientation="vertical" />} size={4}>
										<span>{client.email || 'No email on file'}</span>
										<span>Joined {getReadableDate('TBD')}</span>
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
