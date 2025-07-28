import { Avatar, Progress } from "antd"
import AntDesignOutlined from "@ant-design/icons/AntDesignOutlined"
import { useParams } from "react-router-dom"
import { AppContext } from "../../app-context";
import { useContext } from "react";
import { Panel } from "../Panel";
import type { Client } from "../../../../shared/types";

export function ClientOverview() {

    const { id } = useParams();
    const {state} = useContext(AppContext);

    const selectedClient: Client | undefined = state.clients.find(c => c.id === Number(id));

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
                    icon={<AntDesignOutlined />}
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
                    <h2>{`${selectedClient?.first_name} ${selectedClient.last_name}`}</h2>
                    <div>{selectedClient?.email}</div>
                    <div>{selectedClient?.phone}</div>
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
                        <span>Body Fat:</span><span>17.4%</span>
                    </div>
                    <div>
                        <span>Lean Mass:</span><span>150.6lbs</span>
                    </div>
                    <div>
                        <span>Phase:</span><span>2 - Bulking</span>
                    </div>
                </div>
                <div id='client-progress' style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '15%',
                    height: '100%',
                }}>
                    <Progress type='dashboard' percent={Math.floor((180-170)/(200-170)*100)} gapDegree={90} format={() => `180lbs`} style={{
                        height: "80%"
                    }}/>
                    <div style={{ marginTop: '0.5rem' }}>TW: 200lbs</div>
                </div>
            </>}
        </Panel>
    )
}