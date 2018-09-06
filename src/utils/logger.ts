import * as llama from 'llamajs';
import { config } from '../config';

interface LogMessage extends llama.LogMessage {
    timestamp: Date;
    description: string;
    hostname: string;
}

export class Logger {
    private static logger: llama.Logger;

    public static configure() {
        const rabbitTransport: llama.RabbitMqTransport = new llama.RabbitMqTransport({
            durable: config.logger.durable,
            exchanegType: config.logger.exchangeType,
            exchange: config.logger.exchange,
            format: new llama.JsonFormat({}),
            host: config.logger.host,
            port: config.logger.port,
            levels: [
                llama.syslogSeverityLevels.Informational,
                llama.syslogSeverityLevels.Warning,
                llama.syslogSeverityLevels.Error,
                llama.syslogSeverityLevels.Emergency,
            ],
            password: config.logger.password,
            username: config.logger.username,
            persistent: config.logger.persistent,
        } as llama.RabbitMqConfig);

        const llamaConfig: llama.LoggerConfig = {
            levels: llama.syslogSeverityLevels,
            transports: [rabbitTransport],
        };

        Logger.logger = new llama.Logger(llamaConfig);
    }

    public static log(severity: llama.SeverityLevel, name: string, description: string) {
        if (!Logger.logger) {
            Logger.configure();
        }

        const message: LogMessage = {
            severity,
            name,
            description,
            timestamp: new Date(),
            hostname: config.server.name,
        };
        const rabbitMqTopicKey: string = `${message.severity}.${message.name}.${message.hostname}`;

        Logger.logger.log(message, { routingKey: rabbitMqTopicKey } as llama.RabbitMqMessageConfig);
    }
}
