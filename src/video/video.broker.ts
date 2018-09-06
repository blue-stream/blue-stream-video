import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';

export class VideoService {
    static rmqReceiver: RabbitMQ = new RabbitMQ(config.rabbitMQ.exchanges.videoReceiver);
    static rmqPublisher: RabbitMQ = new RabbitMQ(config.rabbitMQ.exchanges.videoPublisher);

    public static startReceiver() {
        VideoService.rmqReceiver.startReceiver(VideoService.messageHandler);
    }

    public static startPublisher() {
        VideoService.rmqPublisher.startPublisher();
    }

    public static publish(routingKey: string, message: string) {
        VideoService.rmqPublisher.publish(routingKey, message);
    }

    private static messageHandler(message: string) {
        console.log(message);
    }
}
