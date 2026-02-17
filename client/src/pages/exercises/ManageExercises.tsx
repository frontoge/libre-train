import PageLayout from "../../components/PageLayout"
import { ExerciseContext } from "../../contexts/ExercisesContext"
import { getAppConfiguration } from "../../config/app.config";
import type { ExerciseData } from "../../../../shared/MuscleGroups";
import { useEffect, useState, } from "react";
import { Routes } from "../../../../shared/routes";
import { Panel } from "../../components/Panel";
import { ExerciseTable } from "../../components/Exercises/ExerciseTable";

export default function ManageExercises() {

    const [exercises, setExercises] = useState<ExerciseData[]>([]);

    const refreshExercises = async () => {
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}`);
        
        if (response.ok) {
            const exercises: ExerciseData[] = await response.json();
            setExercises(exercises);
        }
    }

    useEffect(() => {
        refreshExercises();
    }, [])


    return (
        <ExerciseContext.Provider value={{ refreshExercises, exerciseData: exercises }}>
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
        </ExerciseContext.Provider>
    )
}