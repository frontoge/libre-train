export type AppConfig = {
	apiUrl: string;
	disableAuth: boolean;
};

const injectedConfig = {
	apiUrl: `${import.meta.env.VITE_API_URL}/api`,
};

const config: { [key: string]: AppConfig } = {
	local: {
		...injectedConfig,
		disableAuth: false,
	},
	dev: {
		...injectedConfig,
		disableAuth: false,
	},
	prod: {
		...injectedConfig,
		disableAuth: false,
	},
};

export function getAppConfiguration(): AppConfig {
	const env = import.meta.env.VITE_ENV || 'local';
	return (config[env] ?? config.local) as AppConfig;
}
