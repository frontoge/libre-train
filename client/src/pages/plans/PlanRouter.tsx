import { Route, Routes } from "react-router-dom";
import { NoPage } from "../NoPage";
import { NewPlan } from "./NewPlan";
import { ManagePlans } from "./ManagePlans";

export function PlanRouter() {
    return (
        <Routes>
            <Route path="create" element={<NewPlan />} />
            <Route index element={<ManagePlans />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
        
    )
}