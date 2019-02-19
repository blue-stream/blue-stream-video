import { IUserClassification } from './user-classification.interface';
import { UserClassificationModel } from './user-classification.model';

export class UserClassificationRepository {
    static createClassifications(classifications: IUserClassification[]): Promise<IUserClassification[]> {
        return UserClassificationModel.insertMany(classifications);
    }

    static getUserClassifications(userId: string): Promise<IUserClassification[]> {
        return UserClassificationModel.find({ user: userId }).exec();
    }

    static removeUserClassifications(userId: string): Promise<void> {
        return UserClassificationModel.remove({ user: userId }).exec();
    }
}
