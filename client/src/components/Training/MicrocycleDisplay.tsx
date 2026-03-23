import { Card, Result, Skeleton } from "antd";
import { useEffect, useState } from "react";
import type { Microcycle, WorkoutRoutine } from "../../../../shared/models";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import dayjs from "../../config/dayjs";
import { fetchMicrocycleRoutines } from "../../helpers/routine-helpers";
import { WorkoutRoutineDisplay } from "../Routines/WorkoutRoutineDisplay";

export interface MicrocycleDisplayProps extends React.ComponentProps<typeof Card> {
    microcycle: Microcycle;
}

export function MicrocycleDisplay(props: MicrocycleDisplayProps) {
    const { microcycle, ...cardProps } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [subCards, setSubCards] = useState<WorkoutRoutine[]>([]);

    const gridStyle: React.CSSProperties = {
        width: subCards.length >= 4 ? 'calc(100% / 5)' : `calc(100% / ${subCards.length})`,
        height: "100%",
        padding: '0.25rem',
    };

    const handleEdit = () => {

    }

    const handleDelete = () => {

    }

    const fetchRoutines = async () => {
        setIsLoading(true);
        const routines = await fetchMicrocycleRoutines(props.microcycle.id);
        setSubCards(routines);
        setIsLoading(false); 
    }

    useEffect(() => {
            fetchRoutines()
    }, [props.microcycle])

    const cardActions = [
            <div key="edit" style={{width: '100%'}} onClick={handleEdit}>
                <MdEdit onClick={handleEdit} />
            </div>,
            <div key="delete" style={{width: '100%'}} onClick={handleDelete}>
                <FaTrash onClick={handleDelete} />
            </div>
        ]

    const loadingSkeleton = Array.from({ length: 6 }).map((_, index) => (
        <Card.Grid key={index} style={{
            width: 'calc(100% / 6)',
            padding: '0.25rem',
        }}>
            <Skeleton active>
                
            </Skeleton>
        </Card.Grid>
    ))

    const resultContent = subCards.length > 0 ? subCards.map((subCard, index) => (
        <Card.Grid key={index} style={gridStyle}>
            <WorkoutRoutineDisplay routine={subCard} bodyStyle={{padding: '1px'}} variant="borderless" />
        </Card.Grid>
    )) : (
        <Result   
            status="warning"
            title="No Microcycles Available"
            subTitle="There are no microcycles to display for this mesocycle."
        />
    )

    return (
        <Card
            title={`${microcycle.cycle_name} (${dayjs(microcycle.cycle_start_date).format("YYYY-MM-DD")} - ${dayjs(microcycle.cycle_end_date).format("YYYY-MM-DD")})`}
            actions={cardActions}
            {...cardProps}
            style={{
                ...cardProps.style
            }}
        >
            {isLoading ? loadingSkeleton : resultContent}
        </Card>
    )
}