import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AppContext } from '../app-context';
import { NavMenu } from '../components/Common/NavMenu';
import { Modals } from '../components/Modals';

export function RouterLayout() {
	const { state } = useContext(AppContext);

	return (
		<Layout
			style={{
				height: '100%',
				width: '100%',
			}}
		>
			{state.selectedModal !== undefined && Modals[state.selectedModal]}
			<Sider collapsible>
				<div
					style={{
						height: '5%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'white',
					}}
				>
					Logo
				</div>
				<NavMenu />
			</Sider>
			<Outlet />
		</Layout>
	);
}
