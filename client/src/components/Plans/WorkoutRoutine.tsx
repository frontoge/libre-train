import { Timeline } from "antd";
import type { WorkoutRoutine } from "../../../../shared/types";
import PlanExercise from "./PlanExercise";

export type WorkoutRoutineProps = {
    selectedRoutine: WorkoutRoutine | undefined;
    editable?: boolean;
    style?: React.CSSProperties | undefined;
    onDelete?: (routineStage: number, stageIndex: number) => void;
    onEdit?: (routineStage: number, stageIndex: number) => void;
};

export function WorkoutRoutine(props: WorkoutRoutineProps) {
    const { selectedRoutine, style, editable } = props;

    const dayRoutineItems = [
        {
            color: 'purple',
            children: (
            <div>
                <span style={{fontWeight: 'bold'}}>Warmup</span>
                {selectedRoutine?.exercises?.filter(ex => ex.routineStage - 1 === 0).map((exercise) => {
                    return <PlanExercise 
                                key={exercise.exerciseId}
                                exercise={exercise}
                                editable={editable}
                                onDelete={() => props.onDelete && props.onDelete(exercise.routineStage, exercise.stage_index)}
                            />
                })}
            </div>)
        },
        {
            color: 'orange',
            children: (
                <div>
                    <span style={{fontWeight: 'bold'}}>Activation</span>
                    {selectedRoutine?.exercises?.filter(ex => ex.routineStage - 1 === 1).map((exercise) => {
                        return <PlanExercise 
                                key={exercise.exerciseId}
                                exercise={exercise}
                                editable={editable}
                                onDelete={() => props.onDelete && props.onDelete(exercise.routineStage, exercise.stage_index)}
                            />
                    })}
                </div>
            )
        },
        {
            color: 'green',
            children: (
            <div>
                <span style={{fontWeight: 'bold'}}>Skill Development</span>
                {selectedRoutine?.exercises?.filter(ex => ex.routineStage - 1 === 2).map((exercise) => {
                    return <PlanExercise 
                                key={exercise.exerciseId}
                                exercise={exercise}
                                editable={editable}
                                onDelete={() => props.onDelete && props.onDelete(exercise.routineStage, exercise.stage_index)}
                            />
                })}
            </div>)
        },
        {
            color: 'cyan',
            children: (
            <div>
                <span style={{fontWeight: 'bold'}}>Resistance Training</span>
                {selectedRoutine?.exercises?.filter(ex => ex.routineStage - 1 === 3).map((exercise) => {
                    return <PlanExercise 
                                key={exercise.exerciseId}
                                exercise={exercise}
                                editable={editable}
                                onDelete={() => props.onDelete && props.onDelete(exercise.routineStage, exercise.stage_index)}
                            />
                })}
            </div>),
        },
        {
            color: 'yellow',
            children: (
                <div>
                    <span style={{fontWeight: 'bold'}}>Free Choice</span>
                </div>
            )
        },
        {
            color: 'red',
            children: (
                <div>
                    <span style={{fontWeight: 'bold'}}>Cooldown</span>
                    {selectedRoutine?.exercises.filter(ex => ex.routineStage - 1 === 5).map((exercise) => {
                        return <PlanExercise 
                                key={exercise.exerciseId}
                                exercise={exercise}
                                editable={editable}
                                onDelete={() => props.onDelete && props.onDelete(exercise.routineStage, exercise.stage_index)}
                            />
                    })}
                </div>
            )
        }
    ];

    return (
        <div
            style={{
                width: '60%',
                height: '100%',
                overflowY: 'auto',
                background: 'transparent',
                borderRadius: 8,
                scrollbarWidth: 'thin', // Firefox
                flex: 1,
                minWidth: 0,
                ...style
            }}
            className="timeline-scroll"
        >
            <Timeline style={{ width: '100%' }} items={dayRoutineItems} />
        </div>
    )
}