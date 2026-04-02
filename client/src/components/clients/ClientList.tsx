import { Avatar, Button, List, Modal, Skeleton } from 'antd';
import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../app-context';
import '../../styles/ClientDashboard/client-list.css';
import { updateClient, updateContact } from '../../helpers/api';
import { ModalType, type ClientContactEditFormValues } from '../../types/types';
import { ClientContactEditForm } from './ClientContactEditForm';

export function ClientList() {
	const { state, stateRefreshers, setState } = useContext(AppContext);
	const [showEditModal, setShowEditModal] = useState(false);
	const navigate = useNavigate();
	const { id } = useParams();

	const selectClient = (clientId: number) => {
		setState((prev) => ({
			...prev,
			selectedClient: prev.clients.find((c) => c.id === clientId),
		}));
		navigate(`/clients/${clientId}`);
	};

	const openDeleteModal = (clientId: number) => {
		setState((prev) => ({
			...prev,
			selectedModal: ModalType.DeleteClient,
			selectedClient: prev.clients.find((c) => c.id === clientId),
		}));
	};

	const handleEditClient = () => {
		setShowEditModal(true);
	};

	const handleEditClientFormSubmit = async (values: ClientContactEditFormValues) => {
		// Two requests, one to update the contact and one to update the client.
		// Check if they have changed before sending the request.
		const { selectedClient } = state;
		if (!selectedClient) return;

		// TODO: Handle image changes
		// Need to check for images too but that will be handled when image persistence is implemented.
		const contactChanged =
			selectedClient.email !== values.email
			|| selectedClient.phone !== values.phoneNumber
			|| selectedClient.first_name !== values.firstName
			|| selectedClient.last_name !== values.lastName
			|| selectedClient.date_of_birth !== values.dob?.format('YYYY-MM-DD');

		const clientChanged = selectedClient.height !== values.height || selectedClient.notes !== values.notes;

		if (contactChanged) {
			try {
				await updateContact(selectedClient.contact_id, {
					email: values.email,
					phone: values.phoneNumber,
					first_name: values.firstName,
					last_name: values.lastName,
					date_of_birth: values.dob?.format('YYYY-MM-DD'),
				});
			} catch (error) {
				console.error('Error updating contact:', error);
			}
		}

		if (clientChanged) {
			try {
				await updateClient(selectedClient.id, {
					height: values.height,
					notes: values.notes,
				});
			} catch (error) {
				console.error('Error updating client:', error);
			}
		}

		setShowEditModal(false);
		stateRefreshers.refreshClients();
	};

	const list = state.clients.map((client) => ({
		id: client.id,
		name: client.first_name + ' ' + client.last_name,
		avatar: client?.img,
		email: client.email,
		loading: false, // You can set this based on your loading state
	}));

	const actionButtonStyles = {
		padding: 0,
		border: 'none',
	};

	return (
		<>
			<List
				className="client-list"
				itemLayout="horizontal"
				dataSource={list}
				renderItem={(item) => (
					<List.Item
						className={`client-list-item ${id !== undefined && item.id == parseInt(id, 10) ? 'client-list-item-selected' : ''}`}
						onClick={() => selectClient(item.id)}
						key={item.id}
						actions={[
							<Button
								type="link"
								key="list-loadmore-edit"
								style={actionButtonStyles}
								onClick={() => handleEditClient()}
							>
								Edit
							</Button>,
							<Button
								type="link"
								key="list-loadmore-more"
								style={actionButtonStyles}
								onClick={() => {
									openDeleteModal(item.id);
								}}
							>
								Remove
							</Button>,
						]}
					>
						<Skeleton avatar title={false} loading={item.loading} active>
							<List.Item.Meta
								avatar={<Avatar src={item.avatar} />}
								title={<div>{item.name}</div>}
								description={item.email}
							/>
						</Skeleton>
					</List.Item>
				)}
			/>
			<Modal
				centered
				open={showEditModal}
				onCancel={() => setShowEditModal(false)}
				footer={null}
				title="Edit Client Contact Info"
			>
				<ClientContactEditForm
					onSubmit={handleEditClientFormSubmit}
					onCancel={() => setShowEditModal(false)}
					initialValues={state.selectedClient}
				/>
			</Modal>
		</>
	);
}
