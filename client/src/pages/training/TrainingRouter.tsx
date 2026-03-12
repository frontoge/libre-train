import { Route, Routes } from "react-router-dom";
import { NoPage } from "../NoPage";
import { NewPlan } from "./NewPlan";
import { ManagePlans } from "./ManagePlans";
import { TodaysPlan } from "./TodaysPlan";
import { RoutineRouter } from "./routines/RoutineRouter";

export function TrainingRouter() {
    return (
        <Routes>
            <Route index element={<ManagePlans />} />
            <Route path="create" element={<NewPlan />} />
            <Route path="view" element={<TodaysPlan />} />
            <Route path="routine/*" element={<RoutineRouter />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
        
    )
}