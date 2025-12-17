import PageLayout from "../../components/PageLayout"
import { ViewExercises } from "../../components/Exercises/ViewExercises"
import { AddExercise } from "../../components/Exercises/AddExercise"
import { ExerciseContext } from "../../contexts/ExercisesContext"
import { getAppConfiguration } from "../../config/app.config";
import type { ExerciseData } from "../../../../shared/MuscleGroups";
import { useEffect, useState, } from "react";
import { Routes } from "../../../../shared/routes";

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
            <PageLayout title="Exercise Manager" style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '2rem',
                margin: '2rem'
            }}>
                <div style={{
                    width: '65%',
                    height: "100%"
                }}>
                    <ViewExercises />
                </div>
                <div style={{
                    width: "35%",
                    height: "100%"
                }}>
                    <AddExercise />
                </div>
            </PageLayout>
        </ExerciseContext.Provider>
    )
}