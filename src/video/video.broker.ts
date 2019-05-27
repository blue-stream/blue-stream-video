import * as rabbit from '../utils/rabbit';
import { VideoStatus } from './video.interface';
import { VideoManager } from './video.manager';

export class VideoBroker {

    public static async subscribe() {
        rabbit.subscribe(
            'application',
            'topic',
            'video-updateAfterUpload-queue',
            'uploader.video.upload.succeeded',
            async (data: any) => {
                await this.updateAfterUpload(data);
                VideoBroker.publishVideoUploaded(data.id, data.key, data.userId);
            });

        rabbit.subscribe(
            'application',
            'topic',
            'video-updateAfterTranscode-queue',
            'transcoder.video.transcode.succeeded',
            async (data: any) => {
                await this.updateAfterTranscode(data);
            });

        rabbit.subscribe(
            'application',
            'topic',
            'video-deleteAfterCancellation-queue',
            'uploader.video.upload.canceled',
            async (data: any) => {
                await this.deleteAfterCancellation(data);
            });

        rabbit.subscribe(
            'application',
            'topic',
            'video-updateStatusFailed-queue',
            '*.video.*.failed',
            async (data: any) => {
                await this.updateStatusFailed(data);
            });
    }

    public static publishVideoUploaded(id: string, key: string, userId: string) {
        rabbit.publish(
            'application',
            'topic',
            'videoService.video.upload.succeeded',
            { id, key, userId },
            { persistent: true },
        );
    }

    public static publishVideoDeleted(id: string, userId: string, contentPath: string, previewPath: string, thumbnailPath: string) {
        rabbit.publish(
            'application',
            'topic',
            'videoService.video.remove.succeeded',
            {
                id,
                userId,
                contentPath,
                previewPath,
                thumbnailPath,
            },
            { persistent: true },
        );
    }

    public static publishVideoFileReplaced(id: string, userId: string, contentPath: string, previewPath: string, thumbnailPath: string) {
        rabbit.publish(
            'application',
            'topic',
            'videoService.video.replaced.succeeded',
            {
                id,
                userId,
                contentPath,
                previewPath,
                thumbnailPath,
            },
            { persistent: true },
        );
    }

    private static updateAfterUpload(data: { id: string, key: string }) {
        return VideoManager.updateById(data.id, {
            status: VideoStatus.UPLOADED,
            originalPath: data.key,
        });
    }

    private static async deleteAfterCancellation(data: { id: string }) {
        const isPublished = await VideoManager.isVideoPublished(data.id);

        // Relevent for reuploades
        if (isPublished) {
            return VideoManager.updateById(data.id, { status: VideoStatus.READY });
        }

        return VideoManager.deleteById(data.id);
    }

    private static updateAfterTranscode(data: {
        id: string,
        contentPath: string,
        thumbnailPath: string,
        previewPath: string,
        userId: string,
    }) {
        return VideoManager.updateById(data.id, {
            contentPath: data.contentPath,
            thumbnailPath: data.thumbnailPath,
            previewPath: data.previewPath,
            status: VideoStatus.READY,
        },
            data.userId);
    }

    public static updateStatusFailed(data: { id: string }) {
        return VideoManager.updateById(data.id, {
            status: VideoStatus.FAILED,
        });
    }
}
