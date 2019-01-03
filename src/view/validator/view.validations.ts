import { Types } from 'mongoose';

export class ViewValidations {
    static isUserValid(user: string) {
        return /\w+@\w+/i.test(user);
    }

    static isVideoValid(video: string) {
        return Types.ObjectId.isValid(video);
    }
}
