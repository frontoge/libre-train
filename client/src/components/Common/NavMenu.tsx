import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { items } from '../../config/nav-menu-items';
import { getNavigationUrl } from '../../helpers/navigation-helpers';

export function NavMenu() {
	const navigate = useNavigate();

	const onClick = (item: { key: string }) => {
		// Navigate to the selected menu item
		navigate(getNavigationUrl(item.key));
	};

	return (
		<Menu
			mode="inline"
			theme="light"
			defaultSelectedKeys={['dashboard']}
			style={{
				height: '100%',
				overflowY: 'auto',
			}}
			onClick={onClick}
			items={items}
		/>
	);
}
