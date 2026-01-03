import { Modal } from "antd";
import React from "react";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";

export type DeletePlanModalProps = {
    onCancel: () => void;
    onComplete?: () => void;
    planId: number | string;
};

export function DeletePlanModal(props: DeletePlanModalProps) {

    const [confirmLoading, setConfirmLoading] = React.useState<boolean>(false);

    const handleDelete = () => {

        const deletePlan = async () => {
            setConfirmLoading(true);
            console.log("Deleting plan with id:", props.planId);
            try {
                const requestOptions = {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Plan}/${props.planId}`, requestOptions);
                if (response.ok) {
                    console.log("Plan deleted successfully");
                }
                props.onComplete && props.onComplete();
            } catch (error) {
                console.error("Error deleting plan:", error);
            } finally {
                setConfirmLoading(false);
                props.onCancel();
            }
        }

        deletePlan();
        
    }

    return (
        <Modal
            title="Delete Plan"
            open={true}
            onOk={handleDelete}
            confirmLoading={confirmLoading}
            onCancel={props.onCancel}
        >
            <p>Are you sure you want to delete this plan? (This is irreversable!)</p>

        </Modal>
    )
}