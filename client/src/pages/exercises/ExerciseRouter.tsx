import { Route, Routes } from "react-router-dom";
import { NoPage } from "../NoPage";
import ManageExercises from "./ManageExercises";

export function ExerciseRouter() {
    return (
        <Routes>
            <Route path="create" element={<ManageExercises />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
        
    )
}