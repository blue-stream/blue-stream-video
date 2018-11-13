import * as amqplib from 'amqplib';
import { config } from '../config';

let connection: amqplib.Connection;
let publishChannel: amqplib.Channel;

export interface SubscribeOptions {
    consumer: amqplib.Options.Consume;
    exchange: amqplib.Options.AssertExchange;
    queue: amqplib.Options.AssertQueue;
    channel: {
        prefetch?: number;
    };
}

const defualtSubscribeOptions: SubscribeOptions = {
    consumer: {
        noAck: false,
    },
    exchange: {
        durable: true,
    },
    queue: {
        durable: true,
    },
    channel: {},
};

export async function connect() {
    const { username, password, host, port } = config.rabbitMQ;
    connection = await amqplib.connect(`amqp://${username}:${password}@${host}:${port}`);

    console.log(`[RabbitMQ] connected on port ${port}`);

    return connection;
}

export function closeConnection() {
    if (connection) {
        connection.close();
    }
}

export async function subscribe(
    exchange: string,
    type: string,
    queue: string,
    pattern: string,
    messageHandler: (message: any) => Promise<void>,
    options: SubscribeOptions = defualtSubscribeOptions,
) {
    if (!connection) {
        throw new Error('No connection available');
    }

    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, type, options.exchange);

    if (options.channel.prefetch) {
        channel.prefetch(options.channel.prefetch);
    }

    const assertedQueue = await channel.assertQueue(queue, options.queue);

    await channel.bindQueue(assertedQueue.queue, exchange, pattern);

    channel.consume(
        queue,
        async (message: amqplib.Message | null) => {
            if (message) {
                const messageString = message.content.toString();
                try {
                    await messageHandler(JSON.parse(messageString));
                    channel.ack(message);
                } catch (err) {
                    channel.nack(message, false, false);
                }
            }
        },
        options.consumer,
    );

    return channel;
}

export async function publish(
    exchange: string,
    routingKey: string,
    message: Object,
    options?: amqplib.Options.Publish,
) {
    if (!publishChannel) {
        publishChannel = await connection.createChannel();
    }

    publishChannel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true, ...options },
    );
}
