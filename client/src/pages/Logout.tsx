import { useEffect } from "react";
import { getAppConfiguration } from "../config/app.config";
import { Routes } from "@libre-train/shared";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


export function Logout() {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const performLogout = async () => {
        try {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' as RequestCredentials
            }
            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthLogout}`, requestOptions);

            if (response.ok) {
                setAuth({ authToken: undefined, user: undefined });
                navigate("/login");
            }
        } catch (error) {
            navigate("/");
        }
    }

    useEffect(() => {
        performLogout();
    }, [])

    return (
        <></>
    )
}