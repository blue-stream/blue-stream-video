import { IVideo } from './video.interface';
import { VideoModel } from './video.model';
import { ServerError } from '../utils/errors/applicationError';

export class VideoRepository {
    static create(video: IVideo): Promise<IVideo> {
        delete video.views;
        return VideoModel.create(video);
    }

    static createMany(videos: IVideo[]): Promise<IVideo[]> {
        return VideoModel.insertMany(videos);
    }

    static async updateById(id: string, video: Partial<IVideo>): Promise<IVideo | null> {
        const videoDocument = await VideoModel.findById(id);

        if (videoDocument) {
            for (const prop in video) {
                videoDocument[prop as keyof IVideo] = video[prop as keyof IVideo];
            }

            return await videoDocument.save({ validateBeforeSave: true });
        }

        return null;
    }

    static deleteById(id: string): Promise<IVideo | null> {
        return VideoModel.findByIdAndRemove(
            id,
        ).exec();
    }

    static getById(id: string): Promise<IVideo | null> {
        return VideoModel.findById(
            id,
        ).exec();
    }

    static getOne(videoFilter: Partial<IVideo>): Promise<IVideo | null> {
        if (Object.keys(videoFilter).length === 0) {
            throw new ServerError('Filter is required.');
        }
        return VideoModel.findOne(
            videoFilter,
        ).exec();
    }

    static getMany(videoFilter: Partial<IVideo>): Promise<IVideo[]> {
        return VideoModel.find(
            videoFilter,
        ).exec();
    }

    static getAmount(videoFilter: Partial<IVideo>): Promise<number> {
        return VideoModel
            .countDocuments(videoFilter)
            .exec();
    }

    static increaseViews(id: string): Promise<IVideo | null> {
        return VideoModel.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true },
        ).exec();
    }
}
