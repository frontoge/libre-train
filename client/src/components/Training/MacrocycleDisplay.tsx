import { Card, Result, Skeleton } from "antd";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MesocycleCard } from "./MesocycleCard";
import type { Macrocycle, Mesocycle } from "../../../../shared/models";
import { useEffect, useState } from "react";
import { fetchChildMesocycles } from "../../helpers/training-helpers";
import dayjs from "../../config/dayjs";

export interface MacrocycleDisplayProps extends React.ComponentProps<typeof Card> {
    macrocycle: Macrocycle;
}

export function MacrocycleDisplay(props: MacrocycleDisplayProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [subCards, setSubCards] = useState<Mesocycle[]>([]);

    const gridStyle: React.CSSProperties = {
        width: subCards.length >= 5 ? 'calc(100% / 6)' : `calc(100% / ${subCards.length})`,
        padding: '0.25rem',
    };

    const handleDelete = () => {
        console.log("Delete macrocycle");
    }

    const handleEdit = () => {
        console.log("Edit macrocycle");
    }

    const fetchMesocycles = async () => {
        setIsLoading(true);
        const mesocycles = await fetchChildMesocycles(props.macrocycle.id, props.macrocycle.client_id);
        mesocycles.sort((a, b) => new Date(a.cycle_start_date).getTime() - new Date(b.cycle_start_date).getTime());
        setSubCards(mesocycles);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchMesocycles()
    }, [props.macrocycle])

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
                <MesocycleCard />
            </Skeleton>
        </Card.Grid>
    ))

    const resultContent = subCards.length > 0 ? subCards.map((subCard, index) => (
        <Card.Grid key={index} style={gridStyle}>
            <MesocycleCard mesocycleData={subCard} index={index} />
        </Card.Grid>
    )) : (
        <Result            
            status="warning"
            title="No Mesocycles Available"
            subTitle="There are no mesocycles to display for this macrocycle."
        />
    )

    return (
        <Card
            title={`${props.macrocycle.cycle_name} (${dayjs(props.macrocycle.cycle_start_date).format("YYYY-MM-DD")} - ${dayjs(props.macrocycle.cycle_end_date).format("YYYY-MM-DD")})`}
            actions={cardActions}
            {...props}
        >
            {isLoading ? loadingSkeleton : resultContent}
        </Card>
    )
}