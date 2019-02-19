import { IVideo } from './video.interface';
import { VideoModel } from './video.model';
import { ServerError } from '../utils/errors/applicationError';
import { config } from '../config';
import { IUserClassification } from '../user-classification/user-classification.interface';
import { VideoAggregator } from './video.aggregator';

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

    static getClassifiedVideos(
        userClassifications: IUserClassification[],
        customMatcher?: Object,
        startIndex: number = 0,
        endIndex: number = config.pagination.resultsPerPage,
        sortOrder: -1 | 1 = -1,
        sortBy: keyof IVideo = 'views',
    ) {
        return VideoModel.aggregate([
            ...customMatcher
                ? [{ $match: customMatcher }]
                : [],
            ...VideoAggregator.getClassificationsAggregator(userClassifications),
            { $sort: { [sortBy]: sortOrder } },
            { $skip: startIndex },
            { $limit: endIndex - startIndex },
        ]).exec();
    }

    static getMany(
        videoFilter: Partial<IVideo>,
        userClassifications: IUserClassification[],
        startIndex: number = 0,
        endIndex: number = config.pagination.resultsPerPage,
        sortOrder: -1 | 1 = -1,
        sortBy: keyof IVideo = 'views',
    ): Promise<IVideo[]> {
        return VideoRepository.getClassifiedVideos(
            userClassifications,
            videoFilter,
            startIndex,
            endIndex,
            sortOrder,
            sortBy,
        );
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

    static getChannelsViews(channelIds: string[]): Promise<{ channel: string, views: number }[]> {
        return VideoModel
            .aggregate()
            .match({ channel: { $in: channelIds } })
            .group({ _id: '$channel', views: { $sum: '$views' } })
            .project({ _id: 0, channel: '$_id', views: 1 })
            .exec();
    }
}
