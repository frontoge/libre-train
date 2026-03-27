import { Menu } from 'antd';
import { IoMdPerson } from 'react-icons/io';
import { type ClientListMenuItem } from '../../types/types';
import { Panel } from '../Panel';
import { ClientList } from './ClientList';

const items: ClientListMenuItem[] = [
	{
		label: 'Clients',
		key: 'clients',
		icon: <IoMdPerson />,
	},
];

export function ClientLists() {
	return (
		<Panel
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
			}}
		>
			<Menu mode="horizontal" items={items} selectedKeys={['clients']} />
			<ClientList />
		</Panel>
	);
}
