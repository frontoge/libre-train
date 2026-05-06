import Divider from 'antd/es/divider';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '../../api/client';
import { getContact } from '../../api/contacts';
import { AppContext } from '../../app-context';
import { ClientEditCreateForm } from '../../components/clients/ClientEditCreateForm';
import { ContactEditCreateForm } from '../../components/Contacts/ContactEditCreateForm';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { useAuth } from '../../hooks/useAuth';
import { useMessage } from '../../hooks/useMessage';
import type { ClientEditCreateFormValues, ContactEditCreateFormValues } from '../../types/types';

export function AddClient() {
	const { user } = useAuth();
	const { stateRefreshers } = useContext(AppContext);
	const showMessage = useMessage();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const contactIdParam = searchParams.get('contactId');
	const contactId = contactIdParam ? parseInt(contactIdParam, 10) : undefined;
	const [contactFormValues, setContactFormValues] = useState<ContactEditCreateFormValues | undefined>(undefined);
	const [clientFormValues, setClientFormValues] = useState<ClientEditCreateFormValues | undefined>(undefined);
	const [formStage, setFormStage] = useState(0);

	useEffect(() => {
		if (contactId === undefined || Number.isNaN(contactId)) return;
		let cancelled = false;
		const load = async () => {
			try {
				const contact = await getContact(contactId);
				if (cancelled) return;
				setContactFormValues({
					firstName: contact.first_name,
					lastName: contact.last_name,
					email: contact.email,
					phoneNumber: contact.phone,
					dob: contact.date_of_birth ? dayjs(contact.date_of_birth) : undefined,
				});
				setFormStage(1);
			} catch (error) {
				console.error('Error loading contact:', error);
				showMessage('error', 'Failed to load contact.');
			}
		};
		void load();
		return () => {
			cancelled = true;
		};
	}, [contactId]);

	const handleContactFormSubmit = (values: ContactEditCreateFormValues): boolean => {
		setContactFormValues(values);
		setFormStage(1);
		return true;
	};

	const handleClientFormSubmit = (values: ClientEditCreateFormValues): boolean => {
		setClientFormValues(values);
		submitAddClientForm(values);
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

	const submitAddClientForm = async (clientValues: ClientEditCreateFormValues) => {
		try {
			const result = await createClient({
				firstName: contactFormValues?.firstName,
				lastName: contactFormValues?.lastName,
				email: contactFormValues?.email,
				phoneNumber: contactFormValues?.phoneNumber,
				dob: contactFormValues?.dob?.format('YYYY-MM-DD'),
				height: clientValues.height,
				notes: clientValues.notes,
				trainerId: user!,
				contactId,
			});
			showMessage('success', 'Client added successfully.');
			stateRefreshers?.refreshClients();
			stateRefreshers?.refreshContacts();
			if (contactId !== undefined) {
				navigate(`/clients/${result.id}`);
			} else {
				resetFormValues();
			}
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
