import { IUserClassification } from './user-classification/user-classification.interface';
import { IUserPp } from './user-pp/user-pp.interface';

export interface IClassification {
    classifications: IUserClassification[];
    pps: IUserPp[];
}
