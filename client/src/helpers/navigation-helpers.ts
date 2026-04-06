import { getNavItemByKey } from '../config/nav-menu-items';

export function getNavigationUrl(key: string): string {
	const navItem = getNavItemByKey(key !== '/' ? key : 'dashboard');
	if (navItem && navItem.urlPath) {
		return navItem.urlPath;
	}
	return '/not-found';
}
