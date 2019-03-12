import { IUserPp } from './user-pp.interface';
import { UserPpModel } from './user-pp.model';
import { PpModel } from '../pp/pp.model';

export class UserPpRepository {
    static createPps(pps: IUserPp[]): Promise<IUserPp[]> {
        return UserPpModel.insertMany(pps);
    }

    static getUserPps(userId: string): Promise<IUserPp[]> {
        return UserPpModel.find({ user: userId }).exec();
    }

    static removeUserPps(userId: string): Promise<void> {
        return UserPpModel.remove({ user: userId }).exec();
    }

    static getSearchedUserPps(userId: string, searchFilter: string = '', isSysAdmin: boolean = false) {
        if (isSysAdmin) {
            return PpModel.aggregate([
                { $match: { name: { $regex: searchFilter, $options: 'i' } } },
                { $project: { id: '$_id', _id: false, name: true } },
            ]);
        }

        return UserPpModel.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: 'pps',
                    let: { ppId: '$ppId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$$ppId', '$_id'],
                                },
                            },
                        },
                        { $match: { name: { $regex: searchFilter, $options: 'i' } } },
                    ],
                    as: 'userPps',
                },
            },
            { $unwind: '$userPps' },
            { $replaceRoot: { newRoot: '$userPps' } },
            { $project: { id: '$_id', _id: false, name: true } },
            { $sort: { name: 1 } },
        ]);
    }
}
