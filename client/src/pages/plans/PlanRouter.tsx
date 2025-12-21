import { Route, Routes } from "react-router-dom";
import { NoPage } from "../NoPage";
import { NewPlan } from "./NewPlan";

export function PlanRouter() {
    return (
        <Routes>
            <Route path="create" element={<NewPlan />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
        
    )
}