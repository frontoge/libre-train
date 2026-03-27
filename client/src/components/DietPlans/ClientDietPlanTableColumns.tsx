import type { ClientDietPlan } from "@libre-train/shared";
import type { ClientDietPlanTableData } from "../../types/types";
import type { TableProps } from "antd/es/table";

export const getClientDietPlanTableData = (plans: ClientDietPlan[]): ClientDietPlanTableData[] => {
    return plans.map(plan => ({
        planId: plan.dietPlanId,
        name: `${plan.first_name} ${plan.last_name}`,
        planName: plan.planName,
        notes: plan.notes,
        calories: plan.targetCalories ,
        protein: plan.targetProtein,
        carbs: plan.targetCarbs,
        fats: plan.targetFats,
        clientId: plan.clientId,
    }));
}

export const ClientDietPlanTableColumns: TableProps<ClientDietPlanTableData>['columns'] = [
    {
        title: 'Client',
        dataIndex: 'name',
        key: 'name',
        width: "15%",
    },
    {
        title: 'Plan Name',
        dataIndex: 'planName',
        key: 'planName',
        width: "15%",
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 6 : 1,
        })
    },
    {
        title: 'Plan Notes',
        dataIndex: 'notes',
        key: 'planNotes',
        width: "30%",
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        }),
        ellipsis: true,
    },
    {
        title: 'Calories',
        dataIndex: 'calories',
        key: 'calories',
        width: "5%",
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    {
        title: 'Protein (g)',
        dataIndex: 'protein',
        key: 'protein',
        width: "5%",
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    {
        title: 'Carbs (g)',
        dataIndex: 'carbs',
        key: 'carbs',
        width: "5%",
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    {
        title: 'Fats (g)',
        dataIndex: 'fats',
        key: 'fats',
        width: "5%",
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    
]