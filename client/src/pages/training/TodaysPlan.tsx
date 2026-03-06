import type { WorkoutRoutine } from "../../../../shared/models";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { WorkoutRoutineDisplay } from "../../components/Routines/WorkoutRoutineDisplay";

export function TodaysPlan(props: any) {

    const routine: WorkoutRoutine = {
        "id": 22,
        "microcycle_id": 8,
        "routine_index": 1,
        "routine_name": "Legs",
        "isActive": true,
        "exercise_groups": [
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 1,
                "exercises": [
                    {
                        "exercise_id": 1,
                        "exerciseName": "Squat",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 185
                    }
                ]
            },
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 2,
                "exercises": [
                    {
                        "exercise_id": 2,
                        "exerciseName": "Bench Press",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 135
                    },
                    {
                        "exercise_id": 34,
                        "exerciseName": "Triceps Rope pushdown",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 55
                    }
                ]
            },
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 4,
                "exercises": [
                    {
                        "exercise_id": 2,
                        "exerciseName": "Bench Press",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 135
                    },
                    {
                        "exercise_id": 34,
                        "exerciseName": "Triceps Rope pushdown",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 55
                    }
                ]
            },
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 4,
                "exercises": [
                    {
                        "exercise_id": 3,
                        "exerciseName": "Lat Pulldown",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 135
                    }
                ]
            }
        ]
    }

    return (
        <PageLayout 
            title="Training Plan Snapshot" 
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '2rem',
                gap: '2rem'
            }}
        >
            <Panel  
                style={{
                    width: '100%',
                    height: "100%",
                    display: 'flex',
                    gap: '1rem',
                    flexDirection: 'column',
                }}
            >
                <WorkoutRoutineDisplay 
                    routine={routine} 
                    isEdit={true}
                    style={{
                        width: "30%"
                    }}
                />
            </Panel>
            
        </PageLayout>
    )
}