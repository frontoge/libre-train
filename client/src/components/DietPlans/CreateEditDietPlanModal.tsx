import { Modal } from "antd";
import { CreateEditDietPlanForm, type CreateEditDietPlanFormValues } from "./CreateEditDietPlanForm";

export interface CreateEditDietPlanModalProps extends React.ComponentProps<typeof Modal> {
    isEdit?: boolean;
    onFinish?: (values: CreateEditDietPlanFormValues) => void;
    initialValues?: Partial<CreateEditDietPlanFormValues>;
}

export function CreateEditDietPlanModal(props: CreateEditDietPlanModalProps) {
    const { isEdit, initialValues, style, onFinish, ...modalProps } = props;
    return (
        <Modal
            style={{
                ...style,
            }}
            footer={null}
            {...modalProps}
        >
            <CreateEditDietPlanForm onFinish={onFinish} isEdit={isEdit} initialValues={initialValues} />
        </Modal>
    )
}