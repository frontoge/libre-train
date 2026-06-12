/// <reference types="vite/client" />
import { Layout } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppContext, DEFAULT_BRAND_NAME } from '../app-context';
import icon from '../assets/icon.svg';
import logo from '../assets/logo.svg';
import { NavMenu } from '../components/Common/NavMenu';

export function RouterLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const {
		state: { branding },
	} = useContext(AppContext);

	const brandName = branding.brand_name || DEFAULT_BRAND_NAME;
	// Use the uploaded logo when one is set; otherwise fall back to the bundled default
	// SVGs (full wordmark when expanded, compact icon when collapsed).
	const logoSrc = branding.logoUrl ?? (collapsed ? icon : logo);

	return (
		<Layout
			style={{
				height: '100%',
				width: '100%',
			}}
		>
			<Sider collapsible theme="dark" collapsed={collapsed} onCollapse={setCollapsed}>
				{/* Flex column so the (always-expanded) group nav can scroll independently of the
				    fixed logo header and the collapse trigger antd renders at the bottom. */}
				<div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					<div
						style={{
							flex: '0 0 auto',
							height: 56,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							padding: 8,
						}}
					>
						<img
							src={logoSrc}
							alt={brandName}
							style={{
								maxHeight: '100%',
								maxWidth: '90%',
								objectFit: 'contain',
							}}
						/>
					</div>
					{/* paddingBottom keeps the last item clear of the absolutely-positioned collapse trigger */}
					<div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', paddingBottom: 48 }}>
						<NavMenu />
					</div>
				</div>
			</Sider>
			<Outlet />
		</Layout>
	);
}
