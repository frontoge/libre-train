import { Panel } from "../Panel";
import { ExerciseTable } from "./ExerciseTable";

export function ViewExercises(props: any) {
    return (
        <Panel style={{
            height: "100%",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'start',
            gap: '2rem',
        }}>
            <h2>Exercises</h2>
            <div style={{
                width: '100%',
                height: '80%'
            }}>
                <ExerciseTable />
            </div>
        </Panel>
    )
}