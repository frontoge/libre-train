import { Route, Routes } from "react-router-dom";
import { AddExercise } from "./AddExercise";
import { NoPage } from "../NoPage";

export function ExerciseRouter() {
    return (
        <Routes>
            <Route path="create" element={<AddExercise />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
        
    )
}