import { Avatar, Progress } from "antd"
import AntDesignOutlined from "@ant-design/icons/AntDesignOutlined"
import { useParams } from "react-router-dom"
import { AppContext } from "../../app-context";
import { useContext } from "react";
import { Panel } from "../Panel";
import type { Client } from "../../../../shared/types";
import { ClientDashboardContext } from "../../contexts/ClientDashboardContext";

export function ClientOverview() {

    const { id } = useParams();
    const {state} = useContext(AppContext);
    const { dashboardState } = useContext(ClientDashboardContext);

    const selectedClient: Client | undefined = state.clients.find(c => c.id === Number(id));

    console.log("Selected Client:", selectedClient);

    const loggedWeight = dashboardState.data.logged_weight ?? 0;
    const targetWeight = dashboardState.data.goal_weight ?? 200;


    return (
        <Panel id='client-dash-information'
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'start',
                height: '20%',
                gap: '2rem',
                padding: '1rem',
            }}>   
            {selectedClient === undefined ?
                <h1 style={{
                    marginLeft: "2rem"
                }}>Select A client</h1>
            :
            <>
                <Avatar
                    size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                    icon={dashboardState.data.img ?? <AntDesignOutlined />}
                />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'start',
                    alignSelf: 'start',
                    gap: '0.1rem',
                    flexGrow: 1,
                }}>
                    <h2>{`${selectedClient?.first_name} ${selectedClient?.last_name}`}</h2>
                    <div>Email: {selectedClient?.email ?? ""}</div>
                    <div>Phone: {selectedClient?.phone ?? ""}</div>
                    <div>{`Height: ${selectedClient?.height ?? "N/A"}`}</div>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.4rem',
                }}>
                    <div>
                        <span>Body Fat:</span><span>{"Coming Soon"}</span>
                    </div>
                    <div>
                        <span>Lean Mass:</span><span>{"Coming Soon"}</span>
                    </div>
                    <div>
                        <span>Phase:</span><span>{"Coming Soon"}</span>
                    </div>
                </div>
                <div id='client-progress' style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '15%',
                    height: '100%',
                }}>
                    <Progress type='dashboard' percent={Math.floor((loggedWeight - 170) / (targetWeight - 170) * 100)} gapDegree={90} format={() => `${loggedWeight}lbs`} style={{
                        height: "80%"
                    }}/>
                    <div style={{ marginTop: '0.5rem' }}>TW: {targetWeight}lbs</div>
                </div>
            </>}
        </Panel>
    )
}