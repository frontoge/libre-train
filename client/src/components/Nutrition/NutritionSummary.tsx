import { ClientDashboardContext } from "../../contexts/ClientDashboardContext";
import { NutritionBar } from "./NutritionBar"
import React from "react";

export function NutritionSummary() {

    const { dashboardState } = React.useContext(ClientDashboardContext);

    return (
        <div className='daily-nutrition' style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            alignItems: 'start',
            width: '100%',
        }}>
            <NutritionBar label="Calories" value={dashboardState.data.logged_calories ?? 0} maxValue={dashboardState.data.target_calories ?? 0} />
            <NutritionBar label="Protein" value={dashboardState.data.logged_protein ?? 0} maxValue={dashboardState.data.target_protein ?? 0} color='orange'/>
            <NutritionBar label="Carbs" value={dashboardState.data.logged_carbs ?? 0} maxValue={dashboardState.data.target_carbs ?? 0} color='green'/>
            <NutritionBar label="Fats" value={dashboardState.data.logged_fats ?? 0} maxValue={dashboardState.data.target_fats ?? 0} color='purple'/>
        </div>
    )
}