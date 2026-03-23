import { Modal } from "antd"
import { WorkoutRoutineDisplay } from "./WorkoutRoutineDisplay"
import type { WorkoutRoutine } from "../../../../shared/models"


export interface RoutineDisplayModalProps extends React.ComponentProps<typeof Modal>{
    routine: WorkoutRoutine
}

export function RoutineDisplayModal(props: RoutineDisplayModalProps) {
    const {routine, ...modalProps} = props

    return (
        <Modal
            {...modalProps}
        >
            <WorkoutRoutineDisplay routine={routine} style={{
                width: "100%",
                height: "100%",
                marginTop: '1.5rem',
            }}/>
        </Modal>
    )
}