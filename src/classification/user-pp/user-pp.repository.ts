import { IUserPp } from './user-pp.interface';
import { UserPpModel } from './user-pp.model';

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
}
