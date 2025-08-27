import { Modal } from "antd";
import React from "react";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";
import { AppContext } from "../../app-context";
import { useNavigate } from "react-router";

export type DeleteClientModalProps = {
};

export function DeleteClientModal(props: DeleteClientModalProps) {

    const [confirmLoading, setConfirmLoading] = React.useState<boolean>(false);
    const { state, setState } = React.useContext(AppContext);
    const navigate = useNavigate();

    const selectedClient = state.selectedClient;

    const handleDelete = () => {
        
        setConfirmLoading(true);
        const deleteClient = async () => {
            if (!selectedClient) return;

            // Call delete client endpoint
            const requestOptions = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            }
            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/${selectedClient?.id}`, requestOptions);

            if (response.ok) {
                setConfirmLoading(false);
                setState(prev => ({
                    ...prev,
                    clients: prev.clients.filter(c => c.id !== selectedClient.id),
                    selectedClient: undefined,
                    selectedModal: undefined,
                }));
                navigate("/clients");
            }

        }

        deleteClient();
    }

    const handleClose = () => {
        setState(prev => ({
            ...prev,
            selectedModal: undefined,
        }));
    }

    return (
        <Modal
            title="Delete Client"
            open={true}
            onOk={handleDelete}
            confirmLoading={confirmLoading}
            onCancel={handleClose}
        >
            <p>Are you sure you want to delete this client? (This is irreversable!)</p>

        </Modal>
    )
}