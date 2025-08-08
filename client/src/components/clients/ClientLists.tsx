import { Menu} from "antd";
import { Panel } from "../Panel";
import { type ClientListMenuItem } from "../../types/types";
import { ClientList } from "./ClientList";
import { IoMdPerson } from "react-icons/io";

  
const items: ClientListMenuItem[] = [
  {
    label: 'Clients',
    key: 'clients',
    icon: <IoMdPerson/>,
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
