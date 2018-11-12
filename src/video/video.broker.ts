import * as rabbit from '../utils/rabbit';
import { VideoStatus } from './video.interface';
import { VideoManager } from './video.manager';

export class VideoBroker {

    public static async subscribe() {
        rabbit.subscribe('application', 'topic', 'video-updateAfterUpload-queue', 'uploader.upload.succeeded', async (data: any) => {
            await this.updateAfterUpload(data);
            VideoBroker.publishVideoUploaded(data.id, data.key);
        });

        rabbit.subscribe('application', 'topic', 'video-updateAfterTranscode-queue', 'transcoder.transcode.succeeded', async (data: any) => {
            await this.updateAfterTranscode(data);
        });
    }

    public static publishVideoUploaded(id: string, key: string) {
        rabbit.publish(
            'application',
            'video.upload.finish',
            { id, key },
            { persistent: true },
        );
    }

    private static updateAfterUpload(data: { id: string, key: string }) {
        return VideoManager.updateById(data.id, {
            status: VideoStatus.UPLOADED,
        });
    }

    private static updateAfterTranscode(data: { id: string, contentUrl: string, thumbnailUrl: string }) {
        return VideoManager.updateById(data.id, {
            contentUrl: data.contentUrl,
            thumbnailUrl: data.thumbnailUrl,
            status: VideoStatus.READY,
        });
    }
}
