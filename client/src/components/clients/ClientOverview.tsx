import { Avatar, Progress } from "antd"
import AntDesignOutlined from "@ant-design/icons/AntDesignOutlined"

export function ClientOverview() {
    return (
        <div id='client-dash-information'
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'start',
                height: '20%',
                borderRadius: '0.5rem',
                gap: '2rem',
                padding: '1rem',
                background: '#141414',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
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
                <h2>Matthew Widenhouse</h2>
                <div>widenhousematthew@gmail.com</div>
                <div>(443) 123-4567</div>
                <div>Height: 6'0"</div>
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
        </div>
    )
}