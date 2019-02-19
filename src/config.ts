export const config = {
    rpc: {
        port: +(process.env.RPC_PORT || 3001),
    },
    db: {
        host: process.env.DB_SERVER || 'localhost',
        name: process.env.DB_NAME || 'blue-stream-video',
        port: +(process.env.DB_PORT || 27017),
    },
    logger: {
        durable: false,
        exchangeType: process.env.RMQ_LOGGER_TYPE || 'topic',
        exchange: process.env.RMQ_LOGGER_EXCHANGE || 'blue_stream_logs',
        host: process.env.RMQ_LOGGER_HOST || 'localhost',
        port: +(process.env.RMQ_LOGGER_PORT || 15672),
        username: process.env.RMQ_LOGGER_USER || 'guest',
        password: process.env.RMQ_LOGGER_PASS || 'guest',
        persistent: false,
    },
    rabbitMQ: {
        host: process.env.RMQ_HOST || 'localhost',
        port: +(process.env.RMQ_PORT || 5672),
        password: process.env.RMQ_PASSWORD || 'guest',
        username: process.env.RMQ_USERNAME || 'guest',
    },
    server: {
        port: +(process.env.PORT || 3000),
        name: process.env.SERVICE_NAME || 'video',
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4200'],
    },
    authentication: {
        required: true,
        secret: process.env.SECRET_KEY || 'bLue5tream@2018',
    },
    allowedExtensions: {
        images: ['png', 'jpg', 'jpeg', 'bmp'],
        videos: ['mkv', 'flv', 'ogg', 'avi', 'mov', 'wmv', 'amv', 'mp4', 'm4p', 'm4v', 'mpv', 'mpg', 'mpeg'],
        previews: ['gif'],
    },
    viewDebounceDuration: +(process.env.VIEW_DEBOUNCE_DURATION || 15), // minutes,
    pagination: {
        resultsPerPage: 20,
    },
    classifications: {
        serviceApi: process.env.CLASSIFICATIONS_API || 'http://localhost:5006/classificationservice/api',
        token: process.env.CLASSIFICATIONS_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.B3bRU1r3QAooc974CfHtGwQUYIUjEV4wywoO0bvOO0E',
        expirationDays: +(process.env.CLASSIFICATIONS_EXPIRATION_DAYS || 3), // Days
    },
};
