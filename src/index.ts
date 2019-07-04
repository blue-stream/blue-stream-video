import * as mongoose from 'mongoose';
import { Server } from './server';
import * as rabbit from './utils/rabbit';
import { log } from './utils/logger';
import { config } from './config';
import { VideoBroker } from './video/video.broker';
import { RPCServer } from './utils/rpc.server';

process.on('uncaughtException', (err) => {
    log('error', 'Unhandled Exception', err.message, undefined, undefined, { error: err });
    rabbit.closeConnection();
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    log('error', 'Unhandled Rejection', err.message, undefined, undefined, { error: err });
    rabbit.closeConnection();
    process.exit(1);
});

process.on('SIGINT', async () => {
    try {
        log('info', 'User Termination', 'application was terminated by the user (SIGINT event)');
        await mongoose.disconnect();
        rabbit.closeConnection();
        process.exit(0);
    } catch (error) {
        log('error', 'Connection error', 'failed to close connection', undefined, undefined, { error });
    }
});

(async () => {
    mongoose.set('useCreateIndex', true);

    mongoose.connection.on('connecting', () => {
        console.log('[MongoDB] connecting...');
    });

    mongoose.connection.on('connected', () => {
        console.log('[MongoDB] connected');
    });

    mongoose.connection.on('error', (error) => {
        console.log('[MongoDB] error');
        console.log(error);
        log('error', 'MongoDB Error', 'A MongoDB error was thrown', '', 'unknown', { error });
        process.exit(1);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('[MongoDB] disconnected');
        log('error', 'MongoDB Disconnected', 'Service was disconneted from MongoDB', '', 'unknown');
        process.exit(1);
    });

    mongoose.connection.on('reconnected', function () {
        console.log('[MongoDB] reconnected');
    });

    await mongoose.connect(
        config.db.connectionString,
        { useNewUrlParser: true },
    );

    log('verbose', 'Server Started', `Port: ${config.server.port}`);

    await rabbit.connect();

    await VideoBroker.subscribe();

    log('verbose', 'RPC', 'starting RPC server');
    RPCServer.http().listen(config.rpc.port, function () {
        log('verbose', 'RPC', `RPC server running on port ${config.rpc.port}`);
    });

    log('verbose', 'Server', 'Starting server');
    const server: Server = Server.bootstrap();

    server.app.on('close', () => {
        rabbit.closeConnection();
        mongoose.disconnect();
        log('verbose', 'Server', 'Server closed');
    });
})();
