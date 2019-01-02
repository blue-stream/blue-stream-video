import { Types } from 'mongoose';

export interface IView {
    video: Types.ObjectId;
    user: string;
    lastViewDate: Date;
}
