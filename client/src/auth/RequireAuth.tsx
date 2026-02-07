import { useContext, type JSX } from "react";
import { AppContext } from "../app-context";
import { Navigate, useLocation } from "react-router";
import { getAppConfiguration } from "../config/app.config";

export function RequireAuth({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useContext(AppContext);
    const config = getAppConfiguration();

    const location = useLocation();

    return isAuthenticated() || config.disableAuth ? children : <Navigate to="/login" replace state={{ from: location }} />;
}