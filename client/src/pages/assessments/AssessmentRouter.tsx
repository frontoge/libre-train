import { Route, Routes } from "react-router-dom";
import { NoPage } from "../NoPage";
import { CreateAssessment } from "./CreateAssessment";

export function AssessmentRouter() {
    return (
        <Routes>
            <Route path="create" element={<CreateAssessment />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
        
    )
}