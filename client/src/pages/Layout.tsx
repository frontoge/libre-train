/// <reference types="vite/client" />
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import icon from '../assets/icon.svg';
import logo from '../assets/logo.svg';
import { NavMenu } from '../components/Common/NavMenu';

export function RouterLayout() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<Layout
			style={{
				height: '100%',
				width: '100%',
			}}
		>
			<Sider collapsible theme="light" collapsed={collapsed} onCollapse={setCollapsed}>
				<div
					style={{
						height: '5%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'white',
					}}
				>
					<img
						src={collapsed ? icon : logo}
						alt="Logo"
						style={{
							maxHeight: '125%',
						}}
					/>
				</div>
				<NavMenu />
			</Sider>
			<Outlet />
		</Layout>
	);
}
