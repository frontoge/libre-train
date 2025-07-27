import PageLayout from "../../components/PageLayout";
import { ClientOverview } from "../../components/clients/ClientOverview";
import { ClientDataViewer } from "../../components/clients/ClientDataViewer";
import { ClientLists } from "../../components/clients/ClientLists";

export function ClientDashboard() {

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