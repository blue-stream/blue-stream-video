export type Configuration = {
    db: {
        host: string;
        name: string;
        port: number;
    };
    logger: {
        durable: boolean;
        exchangeType: string;
        exchange: string;
        host: string;
        port: number;
        password: string;
        username: string;
        persistent: boolean;
    };
    rabbitMQ: {
        host: string;
        exchanges: {
            videoReceiver: string;
            videoPublisher: string;
        };
        reconnect_timeout: number;
    };
    server: {
        port: number,
        name: string,
    };
    authentication: {
        required: boolean;
        secret: string;
    };
};

const development: Configuration = {
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-video',
        port: 27017,
    },
    logger: {
        durable: false,
        exchangeType: 'topic' || process.env.RMQ_LOGGER_TYPE,
        exchange: 'blue_stream_logs' || process.env.RMQ_LOGGER_EXCHANGE,
        host: 'localhost' || process.env.RMQ_LOGGER_HOST,
        port: 15672 || process.env.RMQ_LOGGER_PORT,
        password: 'guest' || process.env.RMQ_LOGGER_PASS,
        username: 'guest' || process.env.RMQ_LOGGER_USER,
        persistent: false,
    },
    rabbitMQ: {
        host: 'localhost',
        exchanges: {
            videoReceiver: 'video',
            videoPublisher: 'video',
        },
        reconnect_timeout: 1000,
    },
    server: {
        port: 3000,
        name: 'video',
    },
    authentication: {
        required: true,
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
};

const production: Configuration = {
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-video',
        port: 27017,
    },
    logger: {
        durable: false,
        exchangeType: 'topic' || process.env.RMQ_LOGGER_TYPE,
        exchange: 'blue_stream_logs' || process.env.RMQ_LOGGER_EXCHANGE,
        host: 'localhost' || process.env.RMQ_LOGGER_HOST,
        port: 15672 || process.env.RMQ_LOGGER_PORT,
        password: 'guest' || process.env.RMQ_LOGGER_PASS,
        username: 'guest' || process.env.RMQ_LOGGER_USER,
        persistent: false,
    },
    rabbitMQ: {
        host: 'localhost',
        exchanges: {
            videoReceiver: 'video',
            videoPublisher: 'video',
        },
        reconnect_timeout: 1000,
    },
    server: {
        port: process.env.PORT ? +process.env.PORT : 3000,
        name: 'video',
    },
    authentication: {
        required: true,
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
};

const test: Configuration = {
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-video-test',
        port: 27017,
    },
    logger: {
        durable: false,
        exchangeType: 'topic' || process.env.RMQ_LOGGER_TYPE,
        exchange: 'blue_stream_logs' || process.env.RMQ_LOGGER_EXCHANGE,
        host: 'localhost' || process.env.RMQ_LOGGER_HOST,
        port: 15672 || process.env.RMQ_LOGGER_PORT,
        password: 'guest' || process.env.RMQ_LOGGER_PASS,
        username: 'guest' || process.env.RMQ_LOGGER_USER,
        persistent: false,
    },
    rabbitMQ: {
        host: 'localhost',
        exchanges: {
            videoReceiver: 'video',
            videoPublisher: 'video',
        },
        reconnect_timeout: 1000,
    },
    server: {
        port: process.env.PORT ? +process.env.PORT : 3000,
        name: 'video',
    },
    authentication: {
        required: true,
        secret: process.env.SECRET_KEY || 'bLue5tream@2018', // Don't use static value in production! remove from source control!
    },
};

const configuration: { [index: string]: Configuration } = {
    development,
    production,
    test,
};

export const config = configuration[process.env.NODE_ENV || 'development'];
