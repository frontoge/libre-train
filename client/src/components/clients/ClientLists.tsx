import { Menu} from "antd";
import { Panel } from "../Panel";
import { MailOutlined} from '@ant-design/icons';
import { type ClientListMenuItem } from "../../types/types";
import { ClientList } from "./ClientList";

const items: ClientListMenuItem[] = [
  {
    label: 'Clients',
    key: 'clients',
    icon: <MailOutlined />,
  }
];

export function ClientLists() {
    return (
        <Panel style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',

        }}>
            <Menu mode='horizontal' items={items} selectedKeys={['clients']}/>
            <ClientList />
        </Panel>
    );
}
