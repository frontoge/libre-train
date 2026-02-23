
export type AppConfig = {
    apiUrl: string;
    disableAuth: boolean;
}

const config: { [key: string]: AppConfig } = {
    local: {
        apiUrl: "http://localhost:3000/api",
        disableAuth: true,
    },
    dev: {
        apiUrl: "https://dev-api.example.com/api",
        disableAuth: false,
    },
    prod: {
        apiUrl: "https://api.example.com/api",
        disableAuth: false,
    }
};

export function getAppConfiguration(): AppConfig {
    const env = import.meta.env.VITE_ENV || 'local';
    return (config[env] ?? config.local) as AppConfig;
}