import { type DashboardWeeklySummary } from "../../../shared/types";
import { type DashboardSummaryState } from "../types/types";

export function mapDashboardSummaryResponse(response: DashboardWeeklySummary[]): DashboardSummaryState {
    

    const thisWeek = response[0];
    const lastWeek = response[1];

    const weightDiff = (lastWeek?.avg_weight && thisWeek?.avg_weight) ? thisWeek.avg_weight - lastWeek.avg_weight : undefined
    const avg_leanMass = calculateLeanMass(thisWeek?.avg_weight, thisWeek?.avg_bodyfat);
    const lastLeanMass = calculateLeanMass(lastWeek?.avg_weight, lastWeek?.avg_bodyfat);
    const leanMassDiff = (avg_leanMass && lastLeanMass) ? (avg_leanMass - lastLeanMass) : undefined;
    const calorieDeficiency = weightDiff ? weightDiff * 500 : undefined;

    return {
        weight: thisWeek.avg_weight ?? "N/A",
        weightDiff: weightDiff,
        calories: thisWeek.avg_calories ?? "N/A",
        caloriesDiff: (lastWeek.avg_calories && thisWeek.avg_calories) ? thisWeek.avg_calories - lastWeek.avg_calories : undefined,
        bodyFat: thisWeek.avg_bodyfat ?? "N/A",
        bodyFatDiff: (lastWeek.avg_bodyfat && thisWeek.avg_bodyfat) ? thisWeek.avg_bodyfat - lastWeek.avg_bodyfat : undefined,
        leanMass: avg_leanMass ?? "N/A",
        leanMassDiff: leanMassDiff ?? undefined,
        calorieDeficiency: calorieDeficiency ?? 'N/A',
        bmr: (thisWeek.avg_calories && calorieDeficiency) ? thisWeek.avg_calories - calorieDeficiency : 'N/A',
        macroAdherence: calculateMacroAdherence(thisWeek.total_macros, thisWeek.target_macros) ?? 'N/A',
    };
}


function calculateMacroAdherence(totalMacros: number | undefined, targetMacros: number | undefined): number | undefined {
    if (!totalMacros || !targetMacros) return undefined;
    const diff = Math.abs(totalMacros - targetMacros);

    return (1 - diff / targetMacros) * 100;
}

function calculateLeanMass(weight: number | undefined, bodyFat: number | undefined): number | undefined {
    if (!weight || !bodyFat) return undefined;
    return weight * (1 - bodyFat / 100);
}