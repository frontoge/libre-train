import PageLayout from "../../components/PageLayout";
import { ClientOverview } from "../../components/clients/ClientOverview";
import { ClientDataViewer } from "../../components/clients/ClientDataViewer";
import { ClientLists } from "../../components/clients/ClientLists";
import { getAppConfiguration } from "../../config/app.config";
import { useContext, useEffect, useState } from "react";
import { Routes } from "../../../../shared/routes";
import { AppContext } from "../../app-context";
import { ClientDashboardContext, type DashboardState, defaultDashboardState } from "../../contexts/ClientDashboardContext";

export function ClientDashboard() {

    const { state, setState } = useContext(AppContext);
    const [dashboardState, setDashboardState] = useState<DashboardState>(defaultDashboardState);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}`, requestOptions);
                console.log(`${getAppConfiguration().apiUrl}${Routes.Clients}`);
                const data = await response.json();
                setState( prev => ({...prev, clients: data}))
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        };

        const fetchDashboardData = async () => {
            try {
                console.log("Fetching dashboard data for client:", state.selectedClient);
                if (state.selectedClient == undefined) {
                    return;
                }

                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/dashboard?clientId=${state.selectedClient}&date=${dashboardState.selectedDate.format("YYYY-MM-DD")}`, requestOptions);
                const data = await response.json();
                setDashboardState(prev => ({
                    ...prev,
                    data
                }));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        }
        if (state.clients.length === 0 || state.selectedClient === undefined) {
            fetchClients();
            return;
        }

        fetchDashboardData();

    }, [state.selectedClient, dashboardState.selectedDate])

    return (
        <ClientDashboardContext value={{dashboardState, setDashboardState}}>
            <PageLayout title="Client Dashboard" style={{ display: 'flex', flexDirection: 'row', overflow: 'hidden'}}>

                <div id='client-dash-left' style={{
                    display: 'flex',
                    gap: '2rem',
                    flexDirection: 'column',
                    width: '70%',
                    padding: '2rem 2rem'
                }}>
                    <ClientOverview />
                    <ClientDataViewer />
                </div>
                <div id='client-dash-right' style={{
                    width: '30%',
                    padding: '2rem 2rem 2rem 1rem',
                }}>
                    <ClientLists />
                </div>
            </PageLayout>
        </ClientDashboardContext>
    );
}