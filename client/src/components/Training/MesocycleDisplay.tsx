import { Card, Result, Skeleton } from "antd";
import type { Mesocycle, Microcycle } from "../../../../shared/models";
import dayjs from "../../config/dayjs";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { fetchChildMicrocycles } from "../../helpers/training-helpers";
import { MicrocycleCard } from "./MicrocycleCard";

export interface MesocycleDisplayProps extends React.ComponentProps<typeof Card> {
    mesocycle: Mesocycle;
}

export function MesocycleDisplay(props: MesocycleDisplayProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [subCards, setSubCards] = useState<Microcycle[]>([]);

    const gridStyle: React.CSSProperties = {
        width: subCards.length >= 4 ? 'calc(100% / 5)' : `calc(100% / ${subCards.length})`,
        padding: '0.25rem',
    };

    const handleEdit = () => {

    }

    const handleDelete = () => {

    }

    const fetchMicrocycles = async () => {
        setIsLoading(true);
        const microcycles = await fetchChildMicrocycles(props.mesocycle.id, props.mesocycle.client_id);
        microcycles.sort((a, b) => new Date(a.cycle_start_date).getTime() - new Date(b.cycle_start_date).getTime());
        setSubCards(microcycles);
        setIsLoading(false); 
    }

    useEffect(() => {
            fetchMicrocycles()
    }, [props.mesocycle])

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
            <MicrocycleCard microcycleData={subCard} index={index} />
        </Card.Grid>
    )) : (
        <Result            
            status="warning"
            title="No Mesocycles Available"
            subTitle="There are no mesocycles to display for this mesocycle."
        />
    )

    return (
        <Card
            title={`${props.mesocycle.cycle_name} (${dayjs(props.mesocycle.cycle_start_date).format("YYYY-MM-DD")} - ${dayjs(props.mesocycle.cycle_end_date).format("YYYY-MM-DD")})`}
            actions={cardActions}
            {...props}
        >
            {isLoading ? loadingSkeleton : resultContent}
        </Card>
    )
}