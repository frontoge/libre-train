import Divider from "antd/es/divider";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { message } from "antd";
import { useContext, useState } from "react";
import { Routes } from "../../../../shared/routes";
import { getAppConfiguration } from "../../config/app.config";
import { AppContext } from "../../app-context";
import { ContactEditCreateForm } from "../../components/Contacts/ContactEditCreateForm";
import { ClientEditCreateForm } from "../../components/clients/ClientEditCreateForm";
import type { ClientEditCreateFormValues, ContactEditCreateFormValues } from "../../types/types";

export function AddClient() {

    const [messageApi, contextHolder] = message.useMessage();
    const { stateRefreshers, state } = useContext(AppContext);
    const [contactFormValues, setContactFormValues] = useState<ContactEditCreateFormValues | undefined>(undefined);
    const [clientFormValues, setClientFormValues] = useState<ClientEditCreateFormValues | undefined>(undefined);
    const [formStage, setFormStage] = useState(0);

    const handleContactFormSubmit = (values: ContactEditCreateFormValues): boolean => {
        setContactFormValues(values);
        setFormStage(1);
        return true;
    }

    const handleClientFormSubmit = (values: ClientEditCreateFormValues): boolean => {
        setClientFormValues(values);
        submitAddClientForm();
        return true;
    }

    const handleClientFormCancel = () => {
        setFormStage(0);
    }

    const formStages = [
        (<ContactEditCreateForm onSubmit={handleContactFormSubmit} initialValues={contactFormValues} />),
        (<ClientEditCreateForm onSubmit={handleClientFormSubmit} initialValues={clientFormValues} onCancel={handleClientFormCancel} />)
    ]

    const resetFormValues = () => {
        setContactFormValues(undefined);
        setClientFormValues(undefined);
        setFormStage(0);
    }

    const submitAddClientForm = async () => {
        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: contactFormValues?.firstName,
                    lastName: contactFormValues?.lastName,
                    email: contactFormValues?.email,
                    phoneNumber: contactFormValues?.phoneNumber,
                    dob: contactFormValues?.dob?.format('YYYY-MM-DD'),
                    height: clientFormValues?.height,
                    notes: clientFormValues?.notes,
                    trainerId: state.auth.user
                }),
            }
            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}`, requestOptions);
            if (!response.ok) {
                messageApi.error('Failed to add client.');
                return;
            }
            await response.json();
            messageApi.success('Client added successfully.');
            resetFormValues();
            stateRefreshers?.refreshClients();
        } catch (error) {
            console.error('Error adding client:', error);
            messageApi.error('An error occurred while adding the client.');
        }
    }

    return (
        <>
            {contextHolder}
            <PageLayout title="Add Client" style={{
                padding: "2rem 3rem",
                display: "flex",
                justifyContent: "center",
            }}>
                <Panel style={{
                    width: "60%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem 3rem",
                    alignItems: "center"
                }}>
                    <h2 style={{
                        marginTop: 0,
                        marginBottom: 0,
                        fontSize: '2rem',
                    }}>
                        New Client
                    </h2>
                    <Divider />
                    {formStages[formStage]}
                </Panel>
            </PageLayout>
        </>
    );
}