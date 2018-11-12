import * as mongoose from 'mongoose';
import { Server } from './server';
import * as rabbit from './utils/rabbit';
import { Logger } from './utils/logger';
import { config } from './config';
import { syslogSeverityLevels } from 'llamajs';
import { VideoBroker } from './video/video.broker';

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception', err.stack);
    rabbit.closeConnection();
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection', err);
    rabbit.closeConnection();
    process.exit(1);
});

process.on('SIGINT', async () => {
    try {
        console.log('User Termination');
        await mongoose.disconnect();
        rabbit.closeConnection();
        process.exit(0);
    } catch (error) {
        console.error('Faild to close connections', error);
    }
});

(async () => {
    await mongoose.connect(
        `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`,
        { useNewUrlParser: true },
    );

    console.log(`[MongoDB] connected to port ${config.db.port}`);

    Logger.configure();
    Logger.log(syslogSeverityLevels.Informational, 'Server Started', `Port: ${config.server.port}`);

    await rabbit.connect();

    await VideoBroker.subscribe();

    console.log('Starting server');
    const server: Server = Server.bootstrap();

    server.app.on('close', () => {
        rabbit.closeConnection();
        mongoose.disconnect();
        console.log('Server closed');
    });
})();
