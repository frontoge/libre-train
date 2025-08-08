import { Spin, Menu} from "antd";
import { Panel } from "../Panel";
import React from "react";
import { ClientDashboardContext } from "../../contexts/ClientDashboardContext";
import { DailyUpdate } from "./Dashboard/DailyUpdate";
import { WeeklySummary } from "./Dashboard/WeeklySummary";

export function ClientDataViewer() {

    const { dashboardState } = React.useContext(ClientDashboardContext);
    const [selectedView, setSelectedView] = React.useState<string>('dailyUpdate');
    

    const viewComponents = {
        dailyUpdate: <DailyUpdate />,
        summaries: <WeeklySummary />,
    }

    const views = [
        {
            key: 'dailyUpdate',
            label: 'Daily Update',
        },
        {
            key: 'summaries',
            label: 'Summaries',
        }
    ]
    

    if (dashboardState.isLoading) {
        return (
            <Panel id="client-dash-data-viewer" style={{
                height: '80%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Spin size="large" tip="Loading client data..." />
            </Panel>
        )
    }

    return (
        <Panel id="client-dash-data-viewer" style={{
            height: '76%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Menu mode='horizontal' selectedKeys={[selectedView]} items={views} onClick={({ key }) => setSelectedView(key)} style={{height: "40px"}} />
            {viewComponents[selectedView]}
        </Panel>
    );
}