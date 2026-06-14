import type { ContactWithFlags, CreateContactRequest, UpdateContactRequest } from '@libre-train/shared';
import { Avatar, Button, Empty, Grid, Input, Modal, Popconfirm, Space, Table, Tag, theme, Tooltip, Typography } from 'antd';
import type { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { useContext, useMemo, useState } from 'react';
import { FaPen, FaPhone, FaPlus, FaRegTrashAlt, FaSearch, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createContact, deleteContact, updateContact } from '../../api/contacts';
import { AppContext } from '../../app-context';
import { ContactEditCreateForm } from '../../components/Contacts/ContactEditCreateForm';
import PageLayout from '../../components/PageLayout';
import { getYearsSinceDate } from '../../helpers/date-helpers';
import { getInitials } from '../../helpers/label-formatters';
import { useMessage } from '../../hooks/useMessage';
import type { ContactEditCreateFormValues } from '../../types/types';

type ContactFilter = 'all' | 'leads' | 'trainers' | 'clients';

interface ContactTableRow {
	key: string;
	id: number;
	avatar?: string;
	firstName: string;
	lastName: string;
	name: string;
	email: string;
	phone?: string;
	dob?: string;
	isTrainer: boolean;
	hasClient: boolean;
}

// Deterministic, pleasant avatar background so each contact reads as distinct at a glance.
const AVATAR_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#f5222d', '#2f54eb'];

const colorForName = (name: string): string => {
	const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const toFormValues = (contact: ContactWithFlags): ContactEditCreateFormValues => ({
	firstName: contact.first_name,
	lastName: contact.last_name,
	email: contact.email,
	phoneNumber: contact.phone,
	dob: contact.date_of_birth ? dayjs(contact.date_of_birth) : undefined,
});

const toRequestPayload = (values: ContactEditCreateFormValues): CreateContactRequest & UpdateContactRequest => ({
	first_name: values.firstName ?? '',
	last_name: values.lastName ?? '',
	email: values.email ?? '',
	phone: values.phoneNumber,
	date_of_birth: values.dob?.format('YYYY-MM-DD'),
});

export function ContactsBrowser() {
	const { token } = theme.useToken();
	const screens = Grid.useBreakpoint();
	const isMobile = !screens.md;
	const navigate = useNavigate();
	const showMessage = useMessage();
	const {
		state: { contacts },
		stateRefreshers,
	} = useContext(AppContext);

	const [searchInput, setSearchInput] = useState('');
	const [filter, setFilter] = useState<ContactFilter>('all');
	const [modalContact, setModalContact] = useState<ContactWithFlags | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const counts = useMemo(
		() => ({
			all: contacts.length,
			leads: contacts.filter((c) => !c.isTrainer && !c.hasClient).length,
			trainers: contacts.filter((c) => c.isTrainer).length,
			clients: contacts.filter((c) => c.hasClient).length,
		}),
		[contacts]
	);

	const tableData: ContactTableRow[] = useMemo(() => {
		const term = searchInput.toLowerCase();
		return contacts
			.filter((c) => {
				if (filter === 'leads' && (c.isTrainer || c.hasClient)) return false;
				if (filter === 'trainers' && !c.isTrainer) return false;
				if (filter === 'clients' && !c.hasClient) return false;
				if (!term) return true;
				const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
				return (
					fullName.includes(term)
					|| c.email.toLowerCase().includes(term)
					|| (c.phone || '').toLowerCase().includes(term)
				);
			})
			.map((c) => ({
				key: c.id.toString(),
				id: c.id,
				avatar: c.img,
				firstName: c.first_name,
				lastName: c.last_name,
				name: `${c.first_name} ${c.last_name}`,
				email: c.email,
				phone: c.phone,
				dob: c.date_of_birth,
				isTrainer: c.isTrainer,
				hasClient: c.hasClient,
			}))
			.sort((a, b) => b.id - a.id);
	}, [contacts, searchInput, filter]);

	const openAddModal = () => {
		setModalContact(null);
		setModalOpen(true);
	};

	const openEditModal = (contact: ContactWithFlags) => {
		setModalContact(contact);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setModalContact(null);
	};

	const handleModalSubmit = (values: ContactEditCreateFormValues): boolean => {
		const payload = toRequestPayload(values);
		const submit = async () => {
			try {
				if (modalContact) {
					await updateContact(modalContact.id, payload);
					showMessage('success', 'Contact updated.');
				} else {
					await createContact(payload);
					showMessage('success', 'Contact created.');
				}
				stateRefreshers?.refreshContacts();
				closeModal();
			} catch (error) {
				console.error('Error saving contact:', error);
				showMessage('error', 'Failed to save contact.');
			}
		};
		void submit();
		return true;
	};

	const handleDelete = async (contactId: number) => {
		try {
			await deleteContact(contactId);
			showMessage('success', 'Contact deleted.');
			stateRefreshers?.refreshContacts();
		} catch (error) {
			console.error('Error deleting contact:', error);
			showMessage('error', 'Failed to delete contact.');
		}
	};

	const handleCreateClientFromContact = (contactId: number) => {
		navigate(`/clients/create?contactId=${contactId}`);
	};

	const findContact = (id: number) => contacts.find((c) => c.id === id);

	const statTiles: { key: ContactFilter; label: string; value: number; accent: string }[] = [
		{ key: 'all', label: 'All contacts', value: counts.all, accent: token.colorPrimary },
		{ key: 'leads', label: 'Leads', value: counts.leads, accent: token.colorWarning },
		{ key: 'trainers', label: 'Trainers', value: counts.trainers, accent: '#722ed1' },
		{ key: 'clients', label: 'Converted', value: counts.clients, accent: token.colorSuccess },
	];

	const statusTag = (record: ContactTableRow) => {
		if (record.isTrainer) return <Tag color="purple">Trainer</Tag>;
		if (record.hasClient) return <Tag color="success">Client</Tag>;
		return <Tag color="gold">Lead</Tag>;
	};

	const columns: TableProps<ContactTableRow>['columns'] = [
		{
			title: 'Contact',
			key: 'name',
			width: 280,
			render: (_, record) => (
				<Space size={12}>
					<Avatar
						size={40}
						src={record.avatar || undefined}
						style={record.avatar ? undefined : { backgroundColor: colorForName(record.name), fontWeight: 600 }}
					>
						{record.avatar ? null : getInitials(record.firstName, record.lastName)}
					</Avatar>
					<div style={{ minWidth: 0 }}>
						<div style={{ fontWeight: 600, color: token.colorText }}>{record.name}</div>
						<Typography.Text
							type="secondary"
							copyable={{ text: record.email, tooltips: ['Copy email', 'Copied'] }}
							style={{ fontSize: 12 }}
						>
							{record.email}
						</Typography.Text>
					</div>
				</Space>
			),
		},
		{
			title: 'Phone',
			dataIndex: 'phone',
			key: 'phone',
			width: 170,
			render: (phone?: string) =>
				phone ? (
					<Space size={6} style={{ color: token.colorTextSecondary }}>
						<FaPhone size={11} style={{ color: token.colorTextTertiary }} />
						<Typography.Text copyable={{ text: phone }}>{phone}</Typography.Text>
					</Space>
				) : (
					<Typography.Text type="secondary">—</Typography.Text>
				),
		},
		{
			title: 'Date of birth',
			dataIndex: 'dob',
			key: 'dob',
			width: 170,
			render: (dob?: string) =>
				dob ? (
					<div>
						<div>{dayjs(dob).format('MMM D, YYYY')}</div>
						<Typography.Text type="secondary" style={{ fontSize: 12 }}>
							{getYearsSinceDate(dob)} years old
						</Typography.Text>
					</div>
				) : (
					<Typography.Text type="secondary">—</Typography.Text>
				),
		},
		{
			title: 'Status',
			key: 'status',
			width: 130,
			render: (_, record) => statusTag(record),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 150,
			align: 'right',
			render: (_, record) => {
				const contact = findContact(record.id);
				const canCreateClient = !record.isTrainer && !record.hasClient;
				return (
					<Space size={2}>
						{canCreateClient && (
							<Tooltip title="Convert to client">
								<Button
									type="text"
									icon={<FaUserPlus />}
									onClick={() => handleCreateClientFromContact(record.id)}
								/>
							</Tooltip>
						)}
						<Tooltip title="Edit">
							<Button
								type="text"
								icon={<FaPen />}
								disabled={!contact}
								onClick={() => contact && openEditModal(contact)}
							/>
						</Tooltip>
						<Popconfirm
							title="Delete this contact?"
							description="This cannot be undone."
							okText="Delete"
							okButtonProps={{ danger: true }}
							onConfirm={() => handleDelete(record.id)}
						>
							<Tooltip title="Delete">
								<Button type="text" danger icon={<FaRegTrashAlt />} />
							</Tooltip>
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	const emptyState = (
		<Empty
			image={Empty.PRESENTED_IMAGE_SIMPLE}
			description={searchInput || filter !== 'all' ? 'No contacts match your filters' : 'No contacts yet'}
		>
			{!searchInput && filter === 'all' && (
				<Button type="primary" icon={<FaPlus />} onClick={openAddModal}>
					Add your first contact
				</Button>
			)}
		</Empty>
	);

	const renderContactCard = (record: ContactTableRow) => {
		const contact = findContact(record.id);
		const canCreateClient = !record.isTrainer && !record.hasClient;
		return (
			<div
				key={record.key}
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
						src={record.avatar || undefined}
						style={record.avatar ? undefined : { backgroundColor: colorForName(record.name), fontWeight: 600 }}
					>
						{record.avatar ? null : getInitials(record.firstName, record.lastName)}
					</Avatar>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
							<span style={{ fontWeight: 600, color: token.colorText, wordBreak: 'break-word' }}>
								{record.name}
							</span>
							{statusTag(record)}
						</div>
						<Typography.Text
							type="secondary"
							copyable={{ text: record.email, tooltips: ['Copy email', 'Copied'] }}
							style={{ fontSize: 13, wordBreak: 'break-all' }}
						>
							{record.email}
						</Typography.Text>
					</div>
				</div>

				{(record.phone || record.dob) && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12, fontSize: 13 }}>
						{record.phone && (
							<Space size={8} style={{ color: token.colorTextSecondary }}>
								<FaPhone size={11} style={{ color: token.colorTextTertiary }} />
								<Typography.Text copyable={{ text: record.phone }}>{record.phone}</Typography.Text>
							</Space>
						)}
						{record.dob && (
							<span style={{ color: token.colorTextSecondary }}>
								{dayjs(record.dob).format('MMM D, YYYY')} · {getYearsSinceDate(record.dob)} years old
							</span>
						)}
					</div>
				)}

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
					{canCreateClient && (
						<Button
							size="small"
							type="text"
							icon={<FaUserPlus />}
							onClick={() => handleCreateClientFromContact(record.id)}
						>
							Convert
						</Button>
					)}
					<Button
						size="small"
						type="text"
						icon={<FaPen />}
						disabled={!contact}
						onClick={() => contact && openEditModal(contact)}
					>
						Edit
					</Button>
					<Popconfirm
						title="Delete this contact?"
						description="This cannot be undone."
						okText="Delete"
						okButtonProps={{ danger: true }}
						onConfirm={() => handleDelete(record.id)}
					>
						<Button size="small" type="text" danger icon={<FaRegTrashAlt />}>
							Delete
						</Button>
					</Popconfirm>
				</div>
			</div>
		);
	};

	return (
		<PageLayout title="Contacts" contentStyle={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
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
							Contacts
						</Typography.Title>
						<Typography.Text type="secondary">Browse, manage, and convert contacts into clients.</Typography.Text>
					</div>
					<Button
						type="primary"
						icon={<FaPlus />}
						onClick={openAddModal}
						size="large"
						block={isMobile}
						style={isMobile ? undefined : { flex: '0 0 auto' }}
					>
						Add Contact
					</Button>
				</div>

				{/* Clickable stat tiles double as quick filters */}
				<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
					{statTiles.map((tile) => {
						const active = filter === tile.key;
						return (
							<button
								key={tile.key}
								type="button"
								onClick={() => setFilter(tile.key)}
								style={{
									flex: isMobile ? '1 1 calc(50% - 0.375rem)' : '1 1 160px',
									minWidth: 0,
									textAlign: 'left',
									cursor: 'pointer',
									padding: isMobile ? '0.625rem 0.875rem' : '0.875rem 1.125rem',
									borderRadius: token.borderRadiusLG,
									border: `1px solid ${active ? tile.accent : token.colorBorderSecondary}`,
									background: active ? `${tile.accent}14` : token.colorBgContainer,
									boxShadow: active ? 'none' : `0 1px 2px ${token.colorBgElevated}`,
									transition: 'all 0.15s ease',
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
									<span
										style={{
											width: 8,
											height: 8,
											borderRadius: '50%',
											background: tile.accent,
											flex: '0 0 auto',
										}}
									/>
									<span
										style={{
											color: token.colorTextSecondary,
											fontSize: 13,
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										{tile.label}
									</span>
								</div>
								<div
									style={{
										fontSize: isMobile ? 22 : 26,
										fontWeight: 700,
										color: token.colorTextHeading,
										marginTop: 4,
									}}
								>
									{tile.value}
								</div>
							</button>
						);
					})}
				</div>

				{/* Table */}
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
					<div style={{ padding: isMobile ? '0.75rem' : '1rem 1rem 0.75rem' }}>
						<Input
							placeholder="Search by name, email, or phone..."
							prefix={<FaSearch style={{ marginRight: 8, color: token.colorTextTertiary }} />}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							allowClear
							size="large"
							style={{ width: '100%', maxWidth: isMobile ? undefined : 420 }}
						/>
					</div>
					{isMobile ? (
						<div style={{ flex: 1, padding: '0 0.75rem 0.75rem' }}>
							{tableData.length === 0 ? (
								<div style={{ padding: '2rem 0' }}>{emptyState}</div>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{tableData.map(renderContactCard)}
								</div>
							)}
						</div>
					) : (
						<Table<ContactTableRow>
							columns={columns}
							dataSource={tableData}
							size="middle"
							style={{ width: '100%', flex: 1 }}
							pagination={{
								pageSize: 12,
								showSizeChanger: false,
								hideOnSinglePage: true,
								style: { padding: '0 1rem' },
							}}
							scroll={{ x: 800 }}
							locale={{ emptyText: emptyState }}
						/>
					)}
				</div>
			</div>

			<Modal
				centered
				open={modalOpen}
				onCancel={closeModal}
				footer={null}
				title={modalContact ? 'Edit Contact' : 'Add Contact'}
				destroyOnHidden
				style={{ maxWidth: 'calc(100vw - 2rem)' }}
			>
				<ContactEditCreateForm
					onSubmit={handleModalSubmit}
					onCancel={closeModal}
					initialValues={modalContact ? toFormValues(modalContact) : undefined}
				/>
			</Modal>
		</PageLayout>
	);
}
