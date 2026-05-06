import type { ClientContact } from '@libre-train/shared';
import { Avatar, Button, Col, Input, Row, Space, Table, Tag, theme, Typography } from 'antd';
import type { TableProps } from 'antd/es/table';
import { useContext, useMemo, useState } from 'react';
import { FaPlus, FaSearchengin } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../app-context';
import PageLayout from '../../components/PageLayout';
import { getYearsSinceDate } from '../../helpers/date-helpers';
import { getInitials } from '../../helpers/label-formatters';

interface ClientTableData {
	key: string;
	id: number;
	avatar: string | undefined;
	firstName: string;
	lastName: string;
	name: string;
	email?: string;
	phone?: string;
	age?: number;
	height?: number;
	notes?: string;
}

export function ClientBrowser() {
	const { token } = theme.useToken();
	const navigate = useNavigate();
	const {
		state: { clients },
	} = useContext(AppContext);
	const [searchInput, setSearchInput] = useState('');

	// Filter and transform client data
	const tableData: ClientTableData[] = useMemo(() => {
		return clients
			.filter((client) => {
				const searchTerm = searchInput.toLowerCase();
				const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
				const email = (client.email || '').toLowerCase();
				const phone = (client.phone || '').toLowerCase();

				return fullName.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm);
			})
			.map((client: ClientContact) => ({
				key: client.ClientId.toString(),
				id: client.ClientId,
				avatar: client.img,
				firstName: client.first_name,
				lastName: client.last_name,
				name: `${client.first_name} ${client.last_name}`,
				email: client.email,
				phone: client.phone,
				age: client.date_of_birth ? getYearsSinceDate(client.date_of_birth) : undefined,
				height: client.height,
				notes: client.notes,
			}))
			.sort((a, b) => b.id - a.id);
	}, [clients, searchInput]);

	const handleClientSelect = (clientId: number) => {
		navigate(`/clients/${clientId}`);
	};

	const handleAddClient = () => {
		navigate('/clients/create');
	};

	const columns: TableProps<ClientTableData>['columns'] = [
		{
			title: 'Name',
			key: 'name',
			width: 180,
			render: (_, record) => (
				<Space>
					<Avatar size={32} src={record.avatar || undefined}>
						{record.avatar ? null : getInitials(record.firstName, record.lastName)}
					</Avatar>
					<div>
						<div style={{ fontWeight: 500 }}>{record.name}</div>
						{record.age !== undefined && (
							<div style={{ fontSize: '12px', color: token.colorTextTertiary }}>{record.age} years old</div>
						)}
					</div>
				</Space>
			),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: 150,
			ellipsis: true,
			render: (email: string | undefined) => (email ? <Typography.Text copyable>{email}</Typography.Text> : '—'),
		},
		{
			title: 'Phone',
			dataIndex: 'phone',
			key: 'phone',
			width: 130,
			ellipsis: true,
			render: (phone: string | undefined) => (phone ? <Typography.Text copyable>{phone}</Typography.Text> : '—'),
		},
		{
			title: 'Height',
			dataIndex: 'height',
			key: 'height',
			width: 90,
			render: (height: number | undefined) => (height ? <Tag color="blue">{height} cm</Tag> : '—'),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 100,
			render: (_, record) => (
				<Button
					type="link"
					onClick={(e) => {
						e.stopPropagation();
						handleClientSelect(record.id);
					}}
				>
					View Details
				</Button>
			),
		},
	];

	return (
		<PageLayout title="Client Browser">
			<div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
				{/* Info Card */}
				<div
					style={{
						backgroundColor: token.colorBgContainer,
						padding: '1.5rem',
						borderRadius: '8px',
						border: `1px solid ${token.colorBorderSecondary}`,
						boxShadow: `0 1px 2px ${token.colorBgElevated}`,
					}}
				>
					<Row gutter={[16, 16]} align="middle" justify="space-between">
						<Col xs={24} sm={12}>
							<Space orientation="vertical" size={2}>
								<Typography.Title
									level={3}
									style={{
										margin: 0,
										color: token.colorTextHeading,
									}}
								>
									{tableData.length} {tableData.length === 1 ? 'Client' : 'Clients'}
								</Typography.Title>
								<Typography.Text type="secondary">Browse and manage all clients in your system</Typography.Text>
							</Space>
						</Col>
						<Col xs={24} sm={12} style={{ textAlign: 'right' }}>
							<Button
								type="primary"
								icon={<FaPlus />}
								onClick={handleAddClient}
								size="large"
								block={typeof window !== 'undefined' && window.innerWidth < 576}
							>
								Add Client
							</Button>
						</Col>
					</Row>
				</div>

				{/* Table */}
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
					<style>
						{`.client-browser-table.ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container {
							border-top-left-radius: 0 !important;
							border-top-right-radius: 0 !important;
							border-start-start-radius: 0 !important;
							border-start-end-radius: 0 !important;
						}
						.client-browser-table.ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-content,
						.client-browser-table.ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header {
							border-top-left-radius: 0 !important;
							border-top-right-radius: 0 !important;
						}
						.client-browser-table.ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container table > thead > tr:first-child > *:first-child {
							border-top-left-radius: 0 !important;
							border-start-start-radius: 0 !important;
						}
						.client-browser-table.ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container table > thead > tr:first-child > *:last-child {
							border-top-right-radius: 0 !important;
							border-start-end-radius: 0 !important;
						}`}
					</style>
					<Table<ClientTableData>
						className="client-browser-table"
						columns={columns}
						dataSource={tableData}
						bordered
						size="small"
						style={{
							width: '100%',
							flex: 1,
						}}
						title={() => (
							<div style={{ display: 'flex', width: '100%', gap: '1rem' }}>
								<Input
									placeholder="Search clients..."
									prefix={<FaSearchengin style={{ marginRight: '8px', color: token.colorTextTertiary }} />}
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									allowClear
									style={{ flex: 1 }}
								/>
							</div>
						)}
						pagination={{
							pageSize: 12,
							showSizeChanger: false,
						}}
						scroll={{ x: 600 }}
						onRow={(record) => ({
							onClick: () => handleClientSelect(record.id),
							style: {
								cursor: 'pointer',
								transition: 'background-color 0.2s ease',
							},
							onMouseEnter: (e) => {
								(e.currentTarget as HTMLElement).style.backgroundColor = token.colorBgTextHover;
							},
							onMouseLeave: (e) => {
								(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
							},
						})}
						locale={{
							emptyText: searchInput ? 'No clients match your search' : 'No clients yet',
						}}
					/>
				</div>
			</div>
		</PageLayout>
	);
}
