import { Card, Result, Skeleton } from "antd";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { MesocycleCard } from "./MesocycleCard";
import type { Mesocycle } from "../../../../shared/models";
import { useState } from "react";

export interface MacrocycleDisplayProps extends React.ComponentProps<typeof Card> {

}

export function MacrocycleDisplay(props: MacrocycleDisplayProps) {
    const [isLoading, setIsLoading] = useState(true);

    const subCards: Mesocycle[] = [
    ]

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
            <MesocycleCard mesocycleData={subCard} />
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
            title="Macrocycle Name (date - date)"
            actions={cardActions}
            {...props}
        >
            {isLoading ? loadingSkeleton : resultContent}
        </Card>
    )
}