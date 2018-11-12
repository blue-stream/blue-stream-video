import { Types } from 'mongoose';
import { IVideo } from '../video.interface';

export class VideoValidatons {
    private static readonly maxTitleLength = 256;
    private static readonly minTitleLength = 3;
    private static readonly maxDescriptionLength = 5000;
    private static readonly userRegex = /\w+@\w+/i;
    private static readonly urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/i;

    static isValid(video: IVideo): boolean {
        return !!video &&
            VideoValidatons.isTitleValid(video.title) &&
            VideoValidatons.isOwnerValid(video.owner) &&
            VideoValidatons.isUrlValid(video.contentPath) &&
            VideoValidatons.isUrlValid(video.thumbnailPath);
    }

    static isIdValid(id: string): boolean {
        return Types.ObjectId.isValid(id);
    }

    static isTitleValid(title: string): boolean {
        const trimmed = title ? title.trim() : null;
        return (
            !!trimmed &&
            trimmed.length <= VideoValidatons.maxTitleLength &&
            trimmed.length >= VideoValidatons.minTitleLength
        );
    }

    static isDescriptionValid(description: string): boolean {
        const trimmed = description ? description.trim() : '';
        return trimmed.length <= VideoValidatons.maxDescriptionLength;
    }

    static isOwnerValid(owner: string): boolean {
        return VideoValidatons.userRegex.test(owner);
    }

    static isUrlValid(url: string): boolean {
        return VideoValidatons.urlRegex.test(url);
    }
}
