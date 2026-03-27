import { Card, Popconfirm, Result, Skeleton } from "antd";
import { useEffect, useState } from "react";
import type { Microcycle, WorkoutRoutine } from "@libre-train/shared";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import dayjs from "../../config/dayjs";
import { fetchMicrocycleRoutines } from "../../helpers/routine-helpers";
import { useNavigate } from "react-router-dom";
import { deleteMicrocycle } from "../../helpers/api";
import { RoutineCard } from "../Routines/RoutineCard";
import { RoutineDisplayModal } from "../Routines/RoutineDisplayModal";

export interface MicrocycleDisplayProps extends React.ComponentProps<typeof Card> {
    microcycle: Microcycle;
    onChange?: () => void;
}

export function MicrocycleDisplay(props: MicrocycleDisplayProps) {
    const navigate = useNavigate();
    const { microcycle, onChange, ...cardProps } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [subCards, setSubCards] = useState<WorkoutRoutine[]>([]);
    const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number | undefined>(undefined);

    const gridStyle: React.CSSProperties = {
        width: subCards.length >= 4 ? 'calc(100% / 5)' : `calc(100% / ${subCards.length})`,
        height: "100%",
        padding: '0.25rem',
    };

    const handleEdit = () => {
        navigate(`/training/cycle/${microcycle.id}/builder/`);
    }

    const handleDelete = async () => {
        const result = await deleteMicrocycle(microcycle.id);
        if (result.ok) {
            onChange?.();
        } else {
            // show error notification
        }
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
            <Popconfirm
                key="delete"
                title="Are you sure you want to delete this microcycle? This action cannot be undone."
                onConfirm={handleDelete}
            >
                <div key="delete" style={{width: '100%'}}>
                    <FaTrash />
                </div>
            </Popconfirm>
            
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
            <RoutineCard
                routine={subCard}
                title={`Day ${index + 1}`}
                variant="borderless"
                onClick={() => setSelectedRoutineIndex(index)}
            />
        </Card.Grid>
    )) : (
        <Result   
            status="warning"
            title="No Microcycles Available"
            subTitle="There are no microcycles to display for this mesocycle."
        />
    )

    return (
        <>
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
        {selectedRoutineIndex !== undefined && (
            <RoutineDisplayModal
                routine={subCards[selectedRoutineIndex]}
                open={selectedRoutineIndex !== undefined}
                onCancel={() => setSelectedRoutineIndex(undefined)}
                okButtonProps={{ style: { display: 'none' } }}
            />
        )}
        </>
    )
}