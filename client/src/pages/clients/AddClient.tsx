import { useContext, useState } from 'react';
import Divider from 'antd/es/divider';
import { AppContext } from '../../app-context';
import { ClientEditCreateForm } from '../../components/clients/ClientEditCreateForm';
import { ContactEditCreateForm } from '../../components/Contacts/ContactEditCreateForm';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { createClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useMessage } from '../../hooks/useMessage';
import type { ClientEditCreateFormValues, ContactEditCreateFormValues } from '../../types/types';

export function AddClient() {
	const { user } = useAuth();
	const { stateRefreshers } = useContext(AppContext);
	const showMessage = useMessage();
	const [contactFormValues, setContactFormValues] = useState<ContactEditCreateFormValues | undefined>(undefined);
	const [clientFormValues, setClientFormValues] = useState<ClientEditCreateFormValues | undefined>(undefined);
	const [formStage, setFormStage] = useState(0);

	const handleContactFormSubmit = (values: ContactEditCreateFormValues): boolean => {
		setContactFormValues(values);
		setFormStage(1);
		return true;
	};

	const handleClientFormSubmit = (values: ClientEditCreateFormValues): boolean => {
		setClientFormValues(values);
		submitAddClientForm();
		return true;
	};

	const handleClientFormCancel = () => {
		setFormStage(0);
	};

	const formStages = [
		<ContactEditCreateForm key={1} onSubmit={handleContactFormSubmit} initialValues={contactFormValues} />,
		<ClientEditCreateForm
			key={2}
			onSubmit={handleClientFormSubmit}
			initialValues={clientFormValues}
			onCancel={handleClientFormCancel}
		/>,
	];

	const resetFormValues = () => {
		setContactFormValues(undefined);
		setClientFormValues(undefined);
		setFormStage(0);
	};

	const submitAddClientForm = async () => {
		try {
			await createClient({
				firstName: contactFormValues?.firstName,
				lastName: contactFormValues?.lastName,
				email: contactFormValues?.email,
				phoneNumber: contactFormValues?.phoneNumber,
				dob: contactFormValues?.dob?.format('YYYY-MM-DD'),
				height: clientFormValues?.height,
				notes: clientFormValues?.notes,
				trainerId: user!,
			});
			showMessage('success', 'Client added successfully.');
			resetFormValues();
			stateRefreshers?.refreshClients();
		} catch (error) {
			console.error('Error adding client:', error);
			showMessage('error', 'An error occurred while adding the client.');
		}
	};

	return (
		<PageLayout
			title="Add Client"
			contentStyle={{
				padding: '2rem 3rem',
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Panel
				style={{
					width: '60%',
					display: 'flex',
					flexDirection: 'column',
					padding: '2rem 3rem',
					alignItems: 'center',
				}}
			>
				<h2
					style={{
						marginTop: 0,
						marginBottom: 0,
						fontSize: '2rem',
					}}
				>
					New Client
				</h2>
				<Divider />
				{formStages[formStage]}
			</Panel>
		</PageLayout>
	);
}
