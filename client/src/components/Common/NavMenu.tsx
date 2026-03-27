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
			defaultSelectedKeys={['1']}
			defaultOpenKeys={['sub1']}
			style={{
				height: '100%',
			}}
			onClick={onClick}
			items={items}
		/>
	);
}
