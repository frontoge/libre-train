import { Route, Routes } from "react-router-dom"
import { NoPage } from "../NoPage"
import { DietPlanBrowse } from "./DietPlanBrowse"
import { CreateDietLog } from "./CreateDietLog"


const DietPlanRouter = () => {
    return (
        <Routes>
            <Route index element={<DietPlanBrowse />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
    )
}

export const DietRouter = () => {
    return (
        <Routes>
            <Route path="plans/*" element={<DietPlanRouter />} />
            <Route path="log" element={<CreateDietLog />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
    )
}