
export type AppConfig = {
    apiUrl: string;
}

const config: { [key: string]: AppConfig } = {
    local: {
        apiUrl: "http://localhost:3000/api"
    },
    dev: {
        apiUrl: "https://dev-api.example.com/api"
    },
    prod: {
        apiUrl: "https://api.example.com/api"
    }
};

export function getAppConfiguration(): AppConfig {
    const env = import.meta.env.VITE_ENV || 'local';
    return (config[env] ?? config.local) as AppConfig;
}