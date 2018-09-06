import * as amqp from 'amqplib';
import { config } from '../config';

export class RabbitMQ {
    static amqpConnection: amqp.Connection;
    amqpChannel!: amqp.Channel;
    amqpExchange: string = '';

    constructor (exchange: string) {
        this.amqpExchange = exchange;
    }

    public static async connect() {
        const connection = await amqp.connect(`amqp://${config.rabbitMQ.host}`);
        connection.on('error', (error) => {
            if (error.message !== 'Connection closing') {
                console.error('[RabbitMQ]', error.message);
            }
        });

        connection.on('close', () => {
            console.error('[RabbitMQ] reconnecting');

            return setTimeout(this.connect, config.rabbitMQ.reconnect_timeout);
        });

        console.log('[RabbitMQ] connected');

        RabbitMQ.amqpConnection = connection;

        return connection;
    }

    public async startPublisher() {
        if (!RabbitMQ.amqpConnection) {
            throw new Error('[RabbitMQ] connection is not open');
        } else {
            const channel = await RabbitMQ.amqpConnection.createChannel();

            channel.assertExchange(this.amqpExchange, 'fanout', { durable: true });

            channel.on('error', (error) => {
                console.error('[RabbitMQ Logger] channel error', error.message);
            });

            channel.on('close', () => {
                console.log('[RabbitMQ Logger] channel closed');
            });

            this.amqpChannel = channel;
        }
    }

    public async startReceiver(messageHandler: (message: string) => void) {
        if (!RabbitMQ.amqpConnection) {
            throw new Error('[RabbitMQ] connection is not open');
        } else {
            const channel = await RabbitMQ.amqpConnection.createChannel();

            channel.assertExchange(this.amqpExchange, 'fanout', { durable: true });

            channel.on('error', (error) => {
                console.error('[RabbitMQ Logger] channel error', error.message);
            });

            channel.on('close', () => {
                console.log('[RabbitMQ Logger] channel closed');
            });

            const queue = await channel.assertQueue('', { exclusive: true });
            console.log(`[RabbitMQ] Waiting for messages in ${queue.queue} queue`);
            channel.bindQueue(queue.queue, this.amqpExchange, '');
            channel.consume(queue.queue, (message) => {
                if (message) {
                    messageHandler(message.content.toString());
                }
            });

            this.amqpExchange = this.amqpExchange;
            this.amqpChannel = channel;
        }
    }

    publish(routingKey: string, message: string) {
        try {
            this.amqpChannel.publish(this.amqpExchange, routingKey, Buffer.from(message), { persistent: true });
        } catch (error) {
            console.error('[RabbitMQ Logger]', error.message);
        }
    }

    public static closeConnection() {
        console.log('[RabbitMQ] Connection closed');
        RabbitMQ.amqpConnection.close();
    }
}
