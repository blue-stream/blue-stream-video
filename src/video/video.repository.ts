import { IUserClassification } from '../classification/user-classification/user-classification.interface';
import { config } from '../config';
import { ServerError } from '../utils/errors/applicationError';
import { VideoAggregator } from './video.aggregator';
import { IVideo } from './video.interface';
import { VideoModel } from './video.model';
import { IClassification } from '../classification/classification.interface';

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
        ).populate('classificationSource').exec();
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
        classifications: IClassification = { pps: [], classifications: [] },
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
            ...VideoAggregator.getClassificationsAggregator(classifications),
            { $sort: { [sortBy]: sortOrder } },
            { $skip: +startIndex },
            { $limit: endIndex - startIndex },
        ]).exec();
    }

    static getMany(
        videoFilter: Partial<IVideo>,
        classifications: IClassification = { pps: [], classifications: [] },
        startIndex: number = 0,
        endIndex: number = config.pagination.resultsPerPage,
        sortOrder: -1 | 1 = -1,
        sortBy: keyof IVideo = 'views',
    ): Promise<IVideo[]> {
        return VideoRepository.getClassifiedVideos(
            classifications,
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

    static getSearched(
        classifications: IClassification = { pps: [], classifications: [] },
        searchFilter: string = '',
        startIndex: number = config.pagination.startIndex,
        endIndex: number = config.pagination.endIndex,
        sortOrder: -1 | 1 = config.sort.sortOrder,
        sortBy: keyof IVideo = config.sort.sortBy,
        videoFilter: Partial<IVideo> = {}) {

        return VideoRepository.getClassifiedVideos(
            classifications,
            {
                ...videoFilter,
                $or: [
                    { title: { $regex: searchFilter, $options: 'i' } },
                    { tags: { $elemMatch: { $regex: searchFilter, $options: 'i' } } },
                    { description: { $regex: searchFilter, $options: 'i' } },
                ],
            },
            startIndex,
            endIndex,
            sortOrder,
            sortBy,
        );
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
