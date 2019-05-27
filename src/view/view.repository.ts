import { IView } from './view.interface';
import { ViewModel } from './view.model';
import { Types } from 'mongoose';
import { config } from '../config';
import { VideoModel } from '../video/video.model';

type ObjectId = Types.ObjectId;

export class ViewRepository {

    static create(video: ObjectId, user: string): Promise<IView> {
        return ViewModel.create({ video, user });
    }

    static getOne(video: ObjectId, user: string): Promise<IView | null> {
        return ViewModel.findOne({ video, user }).exec();
    }

    static getMany(viewFilter: Partial<IView>, startIndex: number = 0, endIndex: number = config.pagination.resultsPerPage, populateVideos: boolean = false): Promise<IView[]> {
        let query = ViewModel
            .find(viewFilter)
            .sort({ lastViewDate: -1 })
            .skip(+startIndex)
            .limit(+endIndex - +startIndex);

        if (populateVideos) query = query.populate('video', null, 'Video');

        return query.exec();
    }

    static getAmount(viewFilter: { [key in keyof IView]?: any }): Promise<number> {
        return ViewModel
            .countDocuments(viewFilter)
            .exec();
    }

    static increaseView(video: ObjectId, user: string): Promise<IView> {
        return ViewModel.findOneAndUpdate(
            { video, user },
            {
                video,
                user,
                $inc: { amount: 1 },
            },
            { new: true, upsert: true },
        ).exec();
    }
}
