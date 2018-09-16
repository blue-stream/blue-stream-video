import { IVideo } from './video.interface';
import { VideoModel } from './video.model';
import { ServerError } from '../utils/errors/applicationError';

export class VideoRepository {
    static create(video: IVideo)
        : Promise<IVideo> {
        return VideoModel.create(video);
    }

    static updateById(id: string, video: Partial<IVideo>)
        : Promise<IVideo | null> {
        return VideoModel.findByIdAndUpdate(
            id,
            { $set: video },
            { new: true, runValidators: true },
        ).exec();
    }

    static deleteById(id: string)
        : Promise<IVideo | null> {
        return VideoModel.findByIdAndRemove(
            id,
        ).exec();
    }

    static getById(id: string)
        : Promise<IVideo | null> {
        return VideoModel.findById(
            id,
        ).exec();
    }

    static getOne(videoFilter: Partial<IVideo>)
        : Promise<IVideo | null> {
        if (Object.keys(videoFilter).length === 0) {
            throw new ServerError('Filter is required.');
        }
        return VideoModel.findOne(
            videoFilter,
        ).exec();
    }

    static getMany(videoFilter: Partial<IVideo>)
        : Promise<IVideo[]> {
        return VideoModel.find(
            videoFilter,
        ).exec();
    }

    static getAmount(videoFilter: Partial<IVideo>)
        : Promise<number> {
        return VideoModel
            .countDocuments(videoFilter)
            .exec();
    }
}
