import { Modal } from "antd";
import { CreateEditExerciseForm } from "./CreateEditExerciseForm";

export interface CreateEditExerciseModalProps extends React.ComponentProps<typeof Modal> {
    initialExerciseId?: number;
    onComplete?: () => void;
}

export function CreateEditExerciseModal(props: CreateEditExerciseModalProps) {
    return (
        <Modal
            {...props}
            footer={null}
        >
            <CreateEditExerciseForm
                initialExerciseId={props.initialExerciseId}
                onComplete={props.onComplete}
            >

            </CreateEditExerciseForm>
        </Modal>
    )
}
