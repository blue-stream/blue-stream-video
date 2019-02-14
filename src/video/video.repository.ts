import { IVideo } from './video.interface';
import { VideoModel } from './video.model';
import { ServerError } from '../utils/errors/applicationError';
import { config } from '../config';

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

    static getMany(
        videoFilter: Partial<IVideo>,
        startIndex: number = 0,
        endIndex: number = config.pagination.resultsPerPage,
        sortOrder: '-' | '' = '-',
        sortBy: string = 'views',
    ): Promise<IVideo[]> {
        return VideoModel
            .find(videoFilter)
            .sort(sortOrder + sortBy)
            .skip(startIndex)
            .limit(endIndex - startIndex)
            .exec();
    }

    static getAmount(videoFilter: Partial<IVideo>): Promise<number> {
        return VideoModel
            .countDocuments(videoFilter)
            .exec();
    }

    static getSearched(
        searchFilter: string = '',
        startIndex: number = config.pagination.startIndex,
        endIndex: number = config.pagination.endIndex,
        sortOrder: string = config.sort.sortOrder,
        sortBy: string = config.sort.sortBy) {
        return VideoModel.find({
            $or: [
                { title: { $regex: searchFilter, $options: 'i' } },
                { tags: { $elemMatch: { $regex: searchFilter, $options: 'i' } } },
                { description: { $regex: searchFilter, $options: 'i' } },
            ],
        })
            .sort(sortOrder + sortBy)
            .skip(+startIndex)
            .limit(endIndex - startIndex)
            .exec();
    }

    static getSearchedAmount(searchFilter: string = '') {
        return VideoModel.countDocuments({
            $or: [
                { title: { $regex: searchFilter, $options: 'i' } },
                { tags: { $elemMatch: { $regex: searchFilter, $options: 'i' } } },
                { description: { $regex: searchFilter, $options: 'i' } },
            ],
        }).exec();
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
