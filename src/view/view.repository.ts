import { IView } from './view.interface';
import { ViewModel } from './view.model';
import { Types } from 'mongoose';

type ObjectId = Types.ObjectId;

export class ViewRepository {

    static create(video: ObjectId, user: string): Promise<IView> {
        return ViewModel.create({ video, user });
    }

    static getOne(video: ObjectId, user: string): Promise<IView | null> {
        return ViewModel.findOne({ video, user }).exec();
    }

    static getMany(viewFilter: Partial<IView>): Promise<IView[]> {
        return ViewModel.find(viewFilter).exec();
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
