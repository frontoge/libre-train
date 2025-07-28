import PageLayout from "../../components/PageLayout";
import { ClientOverview } from "../../components/clients/ClientOverview";
import { ClientDataViewer } from "../../components/clients/ClientDataViewer";
import { ClientLists } from "../../components/clients/ClientLists";
import { getAppConfiguration } from "../../config/app.config";
import { useContext, useEffect } from "react";
import { Routes } from "../../../../shared/routes";
import { AppContext } from "../../app-context";

export function ClientDashboard() {

    const { setState } = useContext(AppContext);

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

        fetchClients();
    }, []);

    return (
        <PageLayout title="Client Dashboard" style={{ display: 'flex', flexDirection: 'row'}}>

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
    );
}