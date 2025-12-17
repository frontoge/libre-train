export type ServerConfig = {
    database: {
        host: string;
        port: number;
        database: string;
    },
    disableAuth: boolean;
}

const config: { [key: string]: ServerConfig } = {
    local: {
        database: {
            host: "edenrp.net",
            port: 3306,
            database: "libre_train"
        },
        disableAuth: true,
    },
    dev: {
        database: {
            host: "dev-db-host",
            port: 3306,
            database: "dev-db"
        },
        disableAuth: false,
    },
    prod: {
        database: {
            host: "prod-db-host",
            port: 3306,
            database: "prod-db"
        },
        disableAuth: false,
    }
}

export const getConfiguration = (): ServerConfig  => {
    const env = process.env.ENVIRONMENT || 'local';
    return (config[env] ?? config.local) as ServerConfig;
}

