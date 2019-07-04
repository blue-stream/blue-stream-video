import { IVideo } from './video/video.interface';

export const config = {
    rpc: {
        port: +(process.env.RPC_PORT || 3001),
    },
    db: {
        connectionString: `mongodb://${process.env.DB_SERVERS || 'localhost:27017'}/${process.env.VIDEOS_DB_NAME || 'blue-stream-video'}${process.env.DB_REPLICA_NAME ? `?replicaSet=${process.env.DB_REPLICA_NAME}` : ''}`,
    },
    logger: {
        elasticsearch: process.env.LOGGER_ELASTICSEARCH && {
            hosts: process.env.LOGGER_ELASTICSEARCH.split(','),
        },
        indexPrefix: process.env.LOGGER_ELASTICSEARCH_PREFIX || 'blue-stream-logs',
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
        videos: ['mkv', 'flv', 'ogg', 'avi', 'mov', 'wmv', 'mp4', 'm4v', 'mpg', 'mpeg'],
        previews: ['gif', 'png', 'jpg', 'jpeg', 'bmp'],
    },
    viewDebounceDuration: +(process.env.VIEW_DEBOUNCE_DURATION || 15), // minutes,
    pagination: {
        resultsPerPage: 20,
        startIndex: 0,
        endIndex: 20,
        maxVideosByIds: 40,
    },
    classifications: {
        token: process.env.CLASSIFICATIONS_API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.B3bRU1r3QAooc974CfHtGwQUYIUjEV4wywoO0bvOO0E',
        expirationDays: +(process.env.CLASSIFICATIONS_EXPIRATION_DAYS || 3), // Days
        service: {
            baseUrl: process.env.CLASSIFICATIONS_API || 'http://localhost:5006/classificationservice/api',
            sourcesEndpoint: process.env.CLASSIFICATIONS_API_SOURCES_ENDPOINT || '/sources',
            ppsEndpoint: process.env.CLASSIFICATIONS_API_PPS_ENDPOINT || '/pps',
            userPermissionsEndpoint: process.env.CLASSIFICATIONS_API_USER_PERMISSIONS_ENDPOINT || '/userPermissions',
        },
        properties: {
            classificationsAllow: process.env.PROPERTY_CLASSIFICATIONS_ALLOW || 'classificationsAllow',
            userClassificationId: process.env.PROPERTY_USER_CLASSIFICATION_ID || 'classificationId',
            userClassificationLayer: process.env.PROPERTY_USER_CLASSIFICATION_LAYER || 'classificationLayer',
            ppsAllow: process.env.PROPERTY_PPS_ALLOW || 'ppAllow',
            userPpsId: process.env.PROPERTY_USER_PPS_ID || 'ppId',
            userPpsType: process.env.PROPERTY_USER_PPS_TYPE || 'ppType',
        },
    },
    sort: {
        sortOrder: -1 as -1 | 1,
        sortBy: 'createdAt' as keyof IVideo,
    },
    validations: {
        maxTitleLength: 256,
        minTitleLength: 3,
        maxDescriptionLength: 5000,
        userRegex: /^[\w-]+@[\w-]+$/i,
    },
};
