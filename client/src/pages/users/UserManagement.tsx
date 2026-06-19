import type { UserWithContact } from '@libre-train/shared';
import {
	Avatar,
	Button,
	Descriptions,
	Drawer,
	Empty,
	Form,
	Grid,
	Input,
	Modal,
	Popconfirm,
	Segmented,
	Space,
	Spin,
	Table,
	Tag,
	theme,
	Tooltip,
	Typography,
} from 'antd';
import type { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { FaEnvelope, FaPen, FaPhone, FaPlus, FaRegTrashAlt, FaSearch, FaUserShield } from 'react-icons/fa';
import { listUsers } from '../../api/users';
import PageLayout from '../../components/PageLayout';
import { getInitials } from '../../helpers/label-formatters';
import { useMessage } from '../../hooks/useMessage';

// Deterministic, pleasant avatar background so each user reads as distinct at a glance.
const AVATAR_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d', '#2f54eb'];

const colorForKey = (key: string): string => {
	const sum = [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const fullName = (user: UserWithContact): string => `${user.first_name} ${user.last_name}`.trim();

type JoinedFilter = 'all' | '7d' | '30d' | 'year';

const JOINED_OPTIONS: { label: string; value: JoinedFilter }[] = [
	{ label: 'All time', value: 'all' },
	{ label: 'Last 7 days', value: '7d' },
	{ label: 'Last 30 days', value: '30d' },
	{ label: 'This year', value: 'year' },
];

const joinedCutoff = (filter: JoinedFilter): dayjs.Dayjs | null => {
	switch (filter) {
		case '7d':
			return dayjs().subtract(7, 'day');
		case '30d':
			return dayjs().subtract(30, 'day');
		case 'year':
			return dayjs().startOf('year');
		default:
			return null;
	}
};

type UserFormValues = {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	username?: string;
	password?: string;
};

export function UserManagement() {
	const { token } = theme.useToken();
	const screens = Grid.useBreakpoint();
	const isMobile = !screens.md;
	const showMessage = useMessage();

	const [users, setUsers] = useState<UserWithContact[]>([]);
	const [loading, setLoading] = useState(true);

	// Filters
	const [searchInput, setSearchInput] = useState('');
	const [joinedFilter, setJoinedFilter] = useState<JoinedFilter>('all');

	// Bulk selection (personnel management — act on many people at once)
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const [drawerUser, setDrawerUser] = useState<UserWithContact | null>(null);
	const [modalUser, setModalUser] = useState<UserWithContact | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [form] = Form.useForm<UserFormValues>();

	useEffect(() => {
		let active = true;
		const load = async () => {
			setLoading(true);
			try {
				const data = await listUsers();
				if (active) setUsers(data);
			} catch (error) {
				console.error('Error fetching users:', error);
				if (active) showMessage('error', 'Failed to load users.');
			} finally {
				if (active) setLoading(false);
			}
		};
		void load();
		return () => {
			active = false;
		};
	}, [showMessage]);

	const filtersActive = searchInput.trim().length > 0 || joinedFilter !== 'all';

	const filteredUsers = useMemo(() => {
		const term = searchInput.trim().toLowerCase();
		const cutoff = joinedCutoff(joinedFilter);
		return [...users]
			.sort((a, b) => b.id - a.id)
			.filter((u) => {
				if (cutoff && !(u.created_at && dayjs(u.created_at).isAfter(cutoff))) return false;
				if (!term) return true;
				return (
					fullName(u).toLowerCase().includes(term)
					|| u.username.toLowerCase().includes(term)
					|| u.email.toLowerCase().includes(term)
					|| (u.phone || '').toLowerCase().includes(term)
				);
			});
	}, [users, searchInput, joinedFilter]);

	const clearFilters = () => {
		setSearchInput('');
		setJoinedFilter('all');
	};

	const openAddModal = () => {
		setModalUser(null);
		form.resetFields();
		setModalOpen(true);
	};

	const openEditModal = (user: UserWithContact) => {
		setModalUser(user);
		form.setFieldsValue({
			firstName: user.first_name,
			lastName: user.last_name,
			email: user.email,
			phone: user.phone,
			username: user.username,
		});
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setModalUser(null);
		form.resetFields();
	};

	// CRUD is intentionally not wired up yet — surface intent without mutating data.
	const handleModalSubmit = () => {
		showMessage('info', `Saving users isn't available yet.`);
		closeModal();
	};

	const handleDelete = (user: UserWithContact) => {
		showMessage('info', `Deleting users isn't available yet.`);
		void user;
	};

	const handleBulkEmail = () => {
		showMessage('info', `Emailing users isn't available yet.`);
	};

	const handleBulkDelete = () => {
		showMessage('info', `Deleting users isn't available yet.`);
	};

	const renderUserCell = (user: UserWithContact) => (
		<Space size={12}>
			<Avatar
				size={40}
				src={user.img || undefined}
				style={user.img ? undefined : { backgroundColor: colorForKey(user.username || user.email), fontWeight: 600 }}
			>
				{user.img ? null : getInitials(user.first_name, user.last_name)}
			</Avatar>
			<div style={{ minWidth: 0 }}>
				<div style={{ fontWeight: 600, color: token.colorText }}>{fullName(user) || user.username}</div>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					@{user.username}
				</Typography.Text>
			</div>
		</Space>
	);

	const columns: TableProps<UserWithContact>['columns'] = [
		{
			title: 'User',
			key: 'user',
			width: 260,
			sorter: (a, b) => fullName(a).localeCompare(fullName(b)),
			render: (_, user) => renderUserCell(user),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: 240,
			sorter: (a, b) => a.email.localeCompare(b.email),
			render: (email: string) => (
				<Space size={6} style={{ color: token.colorTextSecondary }}>
					<FaEnvelope size={11} style={{ color: token.colorTextTertiary }} />
					<Typography.Text copyable={{ text: email }}>{email}</Typography.Text>
				</Space>
			),
		},
		{
			title: 'Phone',
			dataIndex: 'phone',
			key: 'phone',
			width: 170,
			filters: [
				{ text: 'Has phone', value: 'with' },
				{ text: 'Missing phone', value: 'without' },
			],
			onFilter: (value, user) => (value === 'with' ? !!user.phone : !user.phone),
			render: (phone?: string) =>
				phone ? (
					<Space size={6} style={{ color: token.colorTextSecondary }}>
						<FaPhone size={11} style={{ color: token.colorTextTertiary }} />
						<span>{phone}</span>
					</Space>
				) : (
					<Typography.Text type="secondary">—</Typography.Text>
				),
		},
		{
			title: 'Joined',
			dataIndex: 'created_at',
			key: 'created_at',
			width: 150,
			defaultSortOrder: 'descend',
			sorter: (a, b) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf(),
			render: (date?: string) =>
				date ? dayjs(date).format('MMM D, YYYY') : <Typography.Text type="secondary">—</Typography.Text>,
		},
		{
			title: 'Last updated',
			dataIndex: 'updated_at',
			key: 'updated_at',
			width: 150,
			sorter: (a, b) => dayjs(a.updated_at).valueOf() - dayjs(b.updated_at).valueOf(),
			render: (date?: string) =>
				date ? dayjs(date).format('MMM D, YYYY') : <Typography.Text type="secondary">—</Typography.Text>,
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 130,
			align: 'right',
			render: (_, user) => (
				<Space size={2}>
					<Tooltip title="View details">
						<Button type="text" icon={<FaUserShield />} onClick={() => setDrawerUser(user)} />
					</Tooltip>
					<Tooltip title="Edit">
						<Button type="text" icon={<FaPen />} onClick={() => openEditModal(user)} />
					</Tooltip>
					<Popconfirm
						title="Delete this user?"
						description="This cannot be undone."
						okText="Delete"
						okButtonProps={{ danger: true }}
						onConfirm={() => handleDelete(user)}
					>
						<Tooltip title="Delete">
							<Button type="text" danger icon={<FaRegTrashAlt />} />
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	const emptyState = (
		<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={filtersActive ? 'No users match your filters' : 'No users yet'}>
			{filtersActive && <Button onClick={clearFilters}>Clear filters</Button>}
		</Empty>
	);

	const renderUserCard = (user: UserWithContact) => (
		<div
			key={user.id}
			style={{
				border: `1px solid ${token.colorBorderSecondary}`,
				borderRadius: token.borderRadiusLG,
				padding: '0.875rem',
				background: token.colorBgContainer,
			}}
		>
			<div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
				<Avatar
					size={44}
					src={user.img || undefined}
					style={user.img ? undefined : { backgroundColor: colorForKey(user.username || user.email), fontWeight: 600 }}
				>
					{user.img ? null : getInitials(user.first_name, user.last_name)}
				</Avatar>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ fontWeight: 600, color: token.colorText, wordBreak: 'break-word' }}>
						{fullName(user) || user.username}
					</div>
					<Typography.Text type="secondary" style={{ fontSize: 12 }}>
						@{user.username}
					</Typography.Text>
					<div style={{ marginTop: 6 }}>
						<Typography.Text copyable={{ text: user.email }} style={{ fontSize: 13, wordBreak: 'break-all' }}>
							{user.email}
						</Typography.Text>
					</div>
				</div>
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 4,
					marginTop: 12,
					paddingTop: 12,
					borderTop: `1px solid ${token.colorBorderSecondary}`,
				}}
			>
				<Button size="small" type="text" icon={<FaUserShield />} onClick={() => setDrawerUser(user)}>
					View
				</Button>
				<Button size="small" type="text" icon={<FaPen />} onClick={() => openEditModal(user)}>
					Edit
				</Button>
				<Popconfirm
					title="Delete this user?"
					description="This cannot be undone."
					okText="Delete"
					okButtonProps={{ danger: true }}
					onConfirm={() => handleDelete(user)}
				>
					<Button size="small" type="text" danger icon={<FaRegTrashAlt />}>
						Delete
					</Button>
				</Popconfirm>
			</div>
		</div>
	);

	const hasSelection = selectedRowKeys.length > 0;

	return (
		<PageLayout title="User Management" contentStyle={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
			<div style={{ height: isMobile ? 'auto' : '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
				{/* Header */}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
						gap: '1rem',
						flexWrap: 'wrap',
					}}
				>
					<div style={{ flex: '1 1 auto', minWidth: 0 }}>
						<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
							User Management
						</Typography.Title>
						<Typography.Text type="secondary">
							Create, edit, and manage the people with access to your system.
						</Typography.Text>
					</div>
					<Button
						type="primary"
						icon={<FaPlus />}
						onClick={openAddModal}
						size="large"
						block={isMobile}
						style={isMobile ? undefined : { flex: '0 0 auto' }}
					>
						Add User
					</Button>
				</div>

				{/* Table / list */}
				<div
					style={{
						flex: isMobile ? '0 0 auto' : 1,
						display: 'flex',
						flexDirection: 'column',
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
						border: `1px solid ${token.colorBorderSecondary}`,
						boxShadow: `0 1px 2px ${token.colorBgElevated}`,
						overflow: isMobile ? 'visible' : 'hidden',
					}}
				>
					{/* Filter toolbar */}
					<div
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							alignItems: 'center',
							gap: '0.75rem',
							padding: isMobile ? '0.75rem' : '1rem 1rem 0.75rem',
						}}
					>
						<Input
							placeholder="Search by name, username, email, or phone..."
							prefix={<FaSearch style={{ marginRight: 8, color: token.colorTextTertiary }} />}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							allowClear
							size="large"
							style={{ flex: '1 1 280px', minWidth: 0, maxWidth: isMobile ? undefined : 420 }}
						/>
						<Segmented<JoinedFilter>
							options={JOINED_OPTIONS}
							value={joinedFilter}
							onChange={(value) => setJoinedFilter(value)}
							size={isMobile ? 'middle' : 'large'}
							block={isMobile}
						/>
						{filtersActive && (
							<Button type="link" onClick={clearFilters} style={{ paddingInline: 4 }}>
								Clear filters
							</Button>
						)}
						<div style={{ flex: '1 1 auto' }} />
						<Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
							{filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
						</Typography.Text>
					</div>

					{/* Bulk-selection action bar (desktop) */}
					{!isMobile && hasSelection && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '0.75rem',
								padding: '0.5rem 1rem',
								margin: '0 1rem',
								borderRadius: token.borderRadiusLG,
								background: token.colorPrimaryBg,
								border: `1px solid ${token.colorPrimaryBorder}`,
							}}
						>
							<Typography.Text strong>{selectedRowKeys.length} selected</Typography.Text>
							<Button size="small" icon={<FaEnvelope />} onClick={handleBulkEmail}>
								Email
							</Button>
							<Button size="small" danger icon={<FaRegTrashAlt />} onClick={handleBulkDelete}>
								Delete
							</Button>
							<div style={{ flex: '1 1 auto' }} />
							<Button size="small" type="text" onClick={() => setSelectedRowKeys([])}>
								Clear selection
							</Button>
						</div>
					)}

					{loading ? (
						<div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
							<Spin size="large" />
						</div>
					) : isMobile ? (
						<div style={{ flex: 1, padding: '0.25rem 0.75rem 0.75rem' }}>
							{filteredUsers.length === 0 ? (
								<div style={{ padding: '2rem 0' }}>{emptyState}</div>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{filteredUsers.map(renderUserCard)}
								</div>
							)}
						</div>
					) : (
						<Table<UserWithContact>
							rowKey="id"
							columns={columns}
							dataSource={filteredUsers}
							size="middle"
							style={{ width: '100%', flex: 1 }}
							rowSelection={{
								selectedRowKeys,
								onChange: setSelectedRowKeys,
							}}
							pagination={{
								pageSize: 12,
								showSizeChanger: false,
								hideOnSinglePage: true,
								style: { padding: '0 1rem' },
							}}
							scroll={{ x: 1000 }}
							locale={{ emptyText: emptyState }}
						/>
					)}
				</div>
			</div>

			{/* Details drawer (read-only) */}
			<Drawer
				open={!!drawerUser}
				onClose={() => setDrawerUser(null)}
				styles={{ wrapper: { width: isMobile ? '100%' : 420 } }}
				title="User details"
				destroyOnHidden
			>
				{drawerUser && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
							<Avatar
								size={56}
								src={drawerUser.img || undefined}
								style={
									drawerUser.img
										? undefined
										: {
												backgroundColor: colorForKey(drawerUser.username || drawerUser.email),
												fontWeight: 600,
											}
								}
							>
								{drawerUser.img ? null : getInitials(drawerUser.first_name, drawerUser.last_name)}
							</Avatar>
							<div style={{ minWidth: 0 }}>
								<div style={{ fontSize: 18, fontWeight: 700, color: token.colorTextHeading }}>
									{fullName(drawerUser) || drawerUser.username}
								</div>
								<Tag color="blue" style={{ marginTop: 4 }}>
									@{drawerUser.username}
								</Tag>
							</div>
						</div>

						<Descriptions column={1} size="small" bordered>
							<Descriptions.Item label="User ID">{drawerUser.id}</Descriptions.Item>
							<Descriptions.Item label="Email">
								<Typography.Text copyable={{ text: drawerUser.email }}>{drawerUser.email}</Typography.Text>
							</Descriptions.Item>
							<Descriptions.Item label="Phone">{drawerUser.phone || '—'}</Descriptions.Item>
							<Descriptions.Item label="Linked contact">#{drawerUser.contactId}</Descriptions.Item>
							<Descriptions.Item label="Joined">
								{drawerUser.created_at ? dayjs(drawerUser.created_at).format('MMM D, YYYY') : '—'}
							</Descriptions.Item>
							<Descriptions.Item label="Last updated">
								{drawerUser.updated_at ? dayjs(drawerUser.updated_at).format('MMM D, YYYY') : '—'}
							</Descriptions.Item>
						</Descriptions>

						<Button
							type="primary"
							icon={<FaPen />}
							block
							onClick={() => {
								const user = drawerUser;
								setDrawerUser(null);
								openEditModal(user);
							}}
						>
							Edit user
						</Button>
					</div>
				)}
			</Drawer>

			{/* Create / edit modal (UI only — not wired to the API yet) */}
			<Modal
				centered
				open={modalOpen}
				onCancel={closeModal}
				onOk={() => form.submit()}
				okText={modalUser ? 'Save changes' : 'Create user'}
				title={modalUser ? 'Edit User' : 'Add User'}
				destroyOnHidden
				style={{ maxWidth: 'calc(100vw - 2rem)' }}
			>
				<Form form={form} layout="vertical" requiredMark="optional" onFinish={handleModalSubmit} style={{ marginTop: 8 }}>
					<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
						<Form.Item
							name="firstName"
							label="First name"
							rules={[{ required: true, message: 'First name is required' }]}
							style={{ flex: '1 1 160px' }}
						>
							<Input placeholder="Jane" />
						</Form.Item>
						<Form.Item
							name="lastName"
							label="Last name"
							rules={[{ required: true, message: 'Last name is required' }]}
							style={{ flex: '1 1 160px' }}
						>
							<Input placeholder="Doe" />
						</Form.Item>
					</div>
					<Form.Item
						name="email"
						label="Email"
						rules={[
							{ required: true, message: 'Email is required' },
							{ type: 'email', message: 'Enter a valid email' },
						]}
					>
						<Input placeholder="jane.doe@example.com" />
					</Form.Item>
					<Form.Item name="phone" label="Phone">
						<Input placeholder="(555) 123-4567" />
					</Form.Item>
					<Form.Item
						name="username"
						label="Username"
						rules={[
							{ required: true, message: 'Username is required' },
							{ max: 32, message: 'Username must be 32 characters or fewer' },
						]}
					>
						<Input placeholder="janedoe" maxLength={32} />
					</Form.Item>
					{!modalUser && (
						<Form.Item
							name="password"
							label="Temporary password"
							rules={[{ required: true, message: 'Password is required' }]}
						>
							<Input.Password placeholder="Set an initial password" />
						</Form.Item>
					)}
				</Form>
			</Modal>
		</PageLayout>
	);
}
