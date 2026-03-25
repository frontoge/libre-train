import { useContext, type JSX } from "react";
import { AppContext } from "../app-context";
import { Navigate, useLocation } from "react-router";

export function RequireAuth({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useContext(AppContext);

    const location = useLocation();

    return isAuthenticated() ? children : <Navigate to="/login" replace state={{ from: location }} />;
}