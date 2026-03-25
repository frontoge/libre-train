import type { ClientDietPlan } from "../../../../shared/models";
import type { ClientDietPlanTableData } from "../../types/types";
import type { TableProps } from "antd/es/table";

export const getClientDietPlanTableData = (plans: ClientDietPlan[]): ClientDietPlanTableData[] => {
    return plans.map(plan => ({
        planId: plan.dietPlanId,
        name: `${plan.first_name} ${plan.last_name}`,
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
    },
    {
        title: 'Plan Name',
        dataIndex: 'planName',
        key: 'planName',
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 6 : 1,
        })
    },
    {
        title: 'Calories',
        dataIndex: 'calories',
        key: 'calories',
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    {
        title: 'Protein (g)',
        dataIndex: 'protein',
        key: 'protein',
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    {
        title: 'Carbs (g)',
        dataIndex: 'carbs',
        key: 'carbs',
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    {
        title: 'Fats (g)',
        dataIndex: 'fats',
        key: 'fats',
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    },
    {
        title: 'Plan Notes',
        dataIndex: 'notes',
        key: 'planNotes',
        onCell: (record) => ({
            colSpan: record.planId === undefined ? 0 : 1,
        })
    }
    
]