import { Menu } from 'antd';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { items } from '../../config/nav-menu-items';
import { getNavigationUrl } from '../../helpers/navigation-helpers';

type NavEntry = {
	key: string;
	urlPath: string;
};

const normalizePath = (path: string) => {
	if (!path) return '/';
	const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
	const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');
	return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
};

const trimBasePath = (path: string, basePath: string) => {
	const normalizedPath = normalizePath(path);
	const normalizedBase = normalizePath(basePath);

	if (normalizedBase === '/' || !normalizedPath.startsWith(normalizedBase)) {
		return normalizedPath;
	}

	const trimmed = normalizedPath.slice(normalizedBase.length);
	return normalizePath(trimmed);
};

const flattenNavItems = (menuItems: typeof items): NavEntry[] => {
	const flattened: NavEntry[] = [];

	for (const item of menuItems) {
		if (!item) continue;

		if (item.key && item.urlPath) {
			flattened.push({
				key: String(item.key),
				urlPath: item.urlPath,
			});
		}

		if (item.children) {
			flattened.push(...flattenNavItems(item.children));
		}
	}

	return flattened;
};

export function NavMenu() {
	const navigate = useNavigate();
	const location = useLocation();

	const selectedKeys = useMemo(() => {
		const currentPath = trimBasePath(location.pathname, import.meta.env.VITE_BASE_URL ?? '/');
		const entries = flattenNavItems(items)
			.map((entry) => ({
				...entry,
				normalizedPath: normalizePath(entry.urlPath),
			}))
			.filter((entry) => {
				return (
					currentPath === entry.normalizedPath
					|| currentPath.startsWith(`${entry.normalizedPath}/`)
					|| (entry.normalizedPath === '/' && currentPath === '/')
				);
			})
			.sort((a, b) => b.normalizedPath.length - a.normalizedPath.length);

		if (entries.length > 0) {
			return [entries[0].key];
		}

		if (currentPath === '/') {
			return ['dashboard'];
		}

		return [];
	}, [location.pathname]);

	const onClick = (item: { key: string }) => {
		// Navigate to the selected menu item
		navigate(getNavigationUrl(item.key));
	};

	return (
		<Menu
			mode="inline"
			theme="light"
			selectedKeys={selectedKeys}
			style={{
				height: '100%',
				overflowY: 'auto',
			}}
			onClick={onClick}
			items={items}
		/>
	);
}
