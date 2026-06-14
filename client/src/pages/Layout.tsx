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
	const navDisplay = branding.nav_display ?? 'logo';
	// Compact icon for the collapsed rail (and as the mark in "both" mode); full logo/wordmark
	// for the expanded rail. Each falls back to its bundled default SVG when nothing is uploaded.
	const iconSrc = branding.iconUrl ?? icon;
	const logoSrc = branding.logoUrl ?? logo;

	const imgStyle = { maxHeight: '100%', maxWidth: '90%', objectFit: 'contain' } as const;
	const nameStyle = {
		color: 'white',
		fontWeight: 600,
		fontSize: 16,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	} as const;

	const renderHeader = () => {
		if (collapsed) {
			return <img src={iconSrc} alt={brandName} style={imgStyle} />;
		}
		if (navDisplay === 'name') {
			return <span style={nameStyle}>{brandName}</span>;
		}
		if (navDisplay === 'both') {
			return (
				<>
					<img src={iconSrc} alt="" style={{ ...imgStyle, maxHeight: '100%', maxWidth: 32 }} />
					<span style={nameStyle}>{brandName}</span>
				</>
			);
		}
		return <img src={logoSrc} alt={brandName} style={imgStyle} />;
	};

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
							gap: 8,
							color: 'white',
							padding: 8,
						}}
					>
						{renderHeader()}
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
