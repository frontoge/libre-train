export type ServerConfig = {
    database: {
        host: string;
        port: number;
        database: string;
    }
}

const config: { [key: string]: ServerConfig } = {
    local: {
        database: {
            host: "edenrp.net",
            port: 3306,
            database: "libre_train"
        }
    },
    dev: {
        database: {
            host: "dev-db-host",
            port: 3306,
            database: "dev-db"
        }
    },
    prod: {
        database: {
            host: "prod-db-host",
            port: 3306,
            database: "prod-db"
        }
    }
}

export const getConfiguration = (): ServerConfig  => {
    const env = process.env.ENVIRONMENT || 'local';
    return (config[env] ?? config.local) as ServerConfig;
}

