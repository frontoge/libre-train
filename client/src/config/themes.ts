import { theme, type ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
	algorithm: theme.darkAlgorithm, // Enables built-in dark mode

	token: {
		// Primary color (Ant Design will auto-generate the full palette)
		colorPrimary: '#49aa19',
	},

	components: {
		Layout: {
			// Header background (often used in top nav)
			headerBg: '#141414',

			// Sider (sidebar) background — the main one you want to control
			siderBg: '#0f1210',
		},
		Menu: {
			colorSplit: '#0f1210', // Background color of the menu split (divider)
		},
	},
};
