import { RabbitMQ } from '../utils/rabbitMQ';
import { config } from '../config';
import * as RabbitLite from 'rabbit-lite';
import { IVideo } from './video.interface';

export class VideoBroker {
    // public static async assertExchanges() {
    //     await RabbitLite.assertExchange('application', 'topic');
    // }

    // public static async subscribe() {
    //     await RabbitLite.subscribe('video-updateAfterUpload-queue', [
    //         { exchange: 'application', pattern: 'uploader.upload.succeeded' },
    //     ], (message: Object) => { VideoBroker.updateVideoHandler(message) })

    //     await RabbitLite.subscribe('video-updateAfterTranscode-queue', [
    //         { exchange: 'application', pattern: 'transcoder.transcode.succeeded' }
    //     ], (message: Object) => { VideoBroker.updateVideoHandler(message) })
    // }

    // private static updateVideoHandler(video: Partial<IVideo>) {
    //     console.log(video);
    // }
}
