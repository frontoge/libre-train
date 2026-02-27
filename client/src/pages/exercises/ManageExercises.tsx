import PageLayout from "../../components/PageLayout"
import { Panel } from "../../components/Panel";
import { ExerciseTable } from "../../components/Exercises/ExerciseTable";

export default function ManageExercises() {
    return (
        <PageLayout title="Browse Exercises" style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2rem',
            margin: '2rem'
        }}>
            <Panel style={{
                height: "100%",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                gap: '2rem',
            }}>
                <ExerciseTable />
            </Panel>
        </PageLayout>
    )
}