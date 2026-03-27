import { Descriptions, Divider, Modal } from "antd";
import type { ClientDietPlan } from "@libre-train/shared";
import { ClientCard } from "../clients/ClientCard";
import { ClientDietLogHistoryTable } from "./ClientDietLogHistoryTable";

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
            title={`View Diet Plan for ${dietPlan.first_name} ${dietPlan.last_name}`}
            width={"60%"}
            style={{
                ...style,
            }}
            {...modalProps}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
            }}>
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
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
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
                <Divider style={{
                    margin: 0
                }}/>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}>
                    <h3 style={{
                        margin: 0
                    }}>
                        History
                    </h3>
                    <ClientDietLogHistoryTable dietPlanId={dietPlan.dietPlanId} />
                </div>
            </div>
        </Modal>
    )
}