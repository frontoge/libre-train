import { Route, Routes } from "react-router-dom";
import { RoutineEditor } from "./RoutineEditor";


export function RoutineRouter() {
    return (
        <Routes>
            <Route path="editor" element={<RoutineEditor />} />
        </Routes>
    )
}