import { Route, Routes } from "react-router-dom";
import { ClientDashboard } from "./ClientDashboard";
import { AddClient } from "./AddClient";
import { NoPage } from "../NoPage";

export function ClientRouter() {
    return (
        <Routes>
            <Route index element={<ClientDashboard />} />
            <Route path="create" element={<AddClient />} />
            <Route path="*" element={<NoPage />} />
        </Routes>
        
    )
}