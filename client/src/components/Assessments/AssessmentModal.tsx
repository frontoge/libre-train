import { Modal } from "antd";
import { AssessmentCreateEditForm, type AssessmentCreateEditInitialValues } from "./AssessmentCreateEditForm";
import type { AssessmentFormValues } from "../../types/types";

export interface AssessmentModalProps extends React.ComponentProps<typeof Modal> {
    isEdit?: boolean;
    initialValues?: AssessmentCreateEditInitialValues;
    onSubmit?: (values: AssessmentFormValues) => void;
}

export function AssessmentModal(props: AssessmentModalProps) {
    
    return (
        <Modal 
            {...props}
            footer={null}
        >
            <AssessmentCreateEditForm 
                isEdit={props.isEdit} 
                initialValues={props.initialValues} 
                onSubmit={props.onSubmit}
            />
        </Modal>
    )
}