import { Descriptions, Modal } from "antd";
import type { ClientDietPlan } from "../../../../shared/models";
import { ClientCard } from "../clients/ClientCard";

export interface ViewDietPlanModalProps extends React.ComponentProps<typeof Modal> {
    dietPlan: ClientDietPlan;
}

export function ViewDietPlanModal(props: ViewDietPlanModalProps) {
    const { dietPlan, style, ...modalProps } = props;

    const dietPlanDetails = [
        {
            key: 'planName',
            label: 'Plan Name',
            children: dietPlan.planName,
            span: 4,
        },
        {
            key: 'notes',
            label: 'Notes',
            children: dietPlan.notes,
            span: 4
        },
        {
            key: 'calories',
            label: 'Calories',
            children: dietPlan.targetCalories,
        }, 
        {
            key: 'protein',
            label: 'Protein (g)',
            children: dietPlan.targetProtein,
        },
        {
            key: 'carbs',
            label: 'Carbs (g)',
            children: dietPlan.targetCarbs,
        },
        {
            key: 'fats',
            label: 'Fats (g)',
            children: dietPlan.targetFats,
        }
    ]

    return (
        <Modal
            title={`View Diet Plan`}
            width={"60%"}
            style={{
                display: 'flex',
                ...style,
            }}
            {...modalProps}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: "100%",
                width: "100%",
                gap: '2rem',
            }}>
                <ClientCard clientId={dietPlan.clientId} style={{
                    height: "100%",
                    flex: "0 0 35%",
                }}/>
                <Descriptions
                    size="small"
                    bordered
                    column={4}
                    style={{
                        flex: 1,
                        minWidth: 0,
                    }}
                    items={dietPlanDetails}
                />
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
            }}>
                <h4>Log History</h4>
            </div>
        </Modal>
    )
}