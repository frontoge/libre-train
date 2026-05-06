import type { ContactWithFlags, CreateContactRequest, UpdateContactRequest } from '@libre-train/shared';
import { Avatar, Button, Col, Input, Modal, Popconfirm, Row, Space, Switch, Table, Tag, theme, Typography } from 'antd';
import type { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { useContext, useMemo, useState } from 'react';
import { FaPlus, FaSearchengin, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createContact, deleteContact, updateContact } from '../../api/contacts';
import { AppContext } from '../../app-context';
import { ContactEditCreateForm } from '../../components/Contacts/ContactEditCreateForm';
import PageLayout from '../../components/PageLayout';
import { getInitials } from '../../helpers/label-formatters';
import { useMessage } from '../../hooks/useMessage';
import type { ContactEditCreateFormValues } from '../../types/types';

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
	const navigate = useNavigate();
	const showMessage = useMessage();
	const {
		state: { contacts },
		stateRefreshers,
	} = useContext(AppContext);

	const [searchInput, setSearchInput] = useState('');
	const [hideTrainers, setHideTrainers] = useState(true);
	const [hideWithClients, setHideWithClients] = useState(false);
	const [modalContact, setModalContact] = useState<ContactWithFlags | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const tableData: ContactTableRow[] = useMemo(() => {
		const term = searchInput.toLowerCase();
		return contacts
			.filter((c) => {
				if (hideTrainers && c.isTrainer) return false;
				if (hideWithClients && c.hasClient) return false;
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
	}, [contacts, searchInput, hideTrainers, hideWithClients]);

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

	const columns: TableProps<ContactTableRow>['columns'] = [
		{
			title: 'Name',
			key: 'name',
			width: 220,
			render: (_, record) => (
				<Space>
					<Avatar size={32} src={record.avatar || undefined}>
						{record.avatar ? null : getInitials(record.firstName, record.lastName)}
					</Avatar>
					<div style={{ fontWeight: 500 }}>{record.name}</div>
				</Space>
			),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: 200,
			ellipsis: true,
			render: (email: string) => <Typography.Text copyable>{email}</Typography.Text>,
		},
		{
			title: 'Phone',
			dataIndex: 'phone',
			key: 'phone',
			width: 140,
			ellipsis: true,
			render: (phone?: string) => (phone ? <Typography.Text copyable>{phone}</Typography.Text> : '—'),
		},
		{
			title: 'DOB',
			dataIndex: 'dob',
			key: 'dob',
			width: 120,
			render: (dob?: string) => dob ?? '—',
		},
		{
			title: 'Status',
			key: 'status',
			width: 160,
			render: (_, record) => (
				<Space size={4} wrap>
					{record.isTrainer && <Tag color="purple">Trainer</Tag>}
					{record.hasClient && <Tag color="green">Client</Tag>}
					{!record.isTrainer && !record.hasClient && <Tag>Lead</Tag>}
				</Space>
			),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 240,
			render: (_, record) => {
				const contact = findContact(record.id);
				const canCreateClient = !record.isTrainer && !record.hasClient;
				return (
					<Space size={4}>
						{canCreateClient && (
							<Button type="link" icon={<FaUserPlus />} onClick={() => handleCreateClientFromContact(record.id)}>
								Create Client
							</Button>
						)}
						<Button type="link" disabled={!contact} onClick={() => contact && openEditModal(contact)}>
							Edit
						</Button>
						<Popconfirm
							title="Delete this contact?"
							description="This cannot be undone."
							onConfirm={() => handleDelete(record.id)}
						>
							<Button type="link" danger>
								Delete
							</Button>
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	return (
		<PageLayout title="Contacts">
			<div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
								<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
									{tableData.length} {tableData.length === 1 ? 'Contact' : 'Contacts'}
								</Typography.Title>
								<Typography.Text type="secondary">
									Browse, manage, and convert contacts into clients.
								</Typography.Text>
							</Space>
						</Col>
						<Col xs={24} sm={12} style={{ textAlign: 'right' }}>
							<Button type="primary" icon={<FaPlus />} onClick={openAddModal} size="large">
								Add Contact
							</Button>
						</Col>
					</Row>
				</div>

				<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
					<Table<ContactTableRow>
						columns={columns}
						dataSource={tableData}
						bordered
						size="small"
						style={{ width: '100%', flex: 1 }}
						title={() => (
							<div style={{ display: 'flex', width: '100%', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
								<Input
									placeholder="Search contacts..."
									prefix={<FaSearchengin style={{ marginRight: '8px', color: token.colorTextTertiary }} />}
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									allowClear
									style={{ flex: 1, minWidth: 200 }}
								/>
								<Space size="middle">
									<Space size={6}>
										<Switch checked={hideTrainers} onChange={setHideTrainers} size="small" />
										<Typography.Text>Hide trainers</Typography.Text>
									</Space>
									<Space size={6}>
										<Switch checked={hideWithClients} onChange={setHideWithClients} size="small" />
										<Typography.Text>Hide contacts with clients</Typography.Text>
									</Space>
								</Space>
							</div>
						)}
						pagination={{ pageSize: 12, showSizeChanger: false }}
						scroll={{ x: 800 }}
						locale={{ emptyText: searchInput ? 'No contacts match your search' : 'No contacts yet' }}
					/>
				</div>
			</div>

			<Modal
				centered
				open={modalOpen}
				onCancel={closeModal}
				footer={null}
				title={modalContact ? 'Edit Contact' : 'Add Contact'}
				destroyOnHidden
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
