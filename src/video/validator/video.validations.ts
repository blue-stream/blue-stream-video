import { Types } from 'mongoose';
import { IVideo, VideoStatus } from '../video.interface';
import { config } from '../../config';

export class VideoValidatons {
    private static readonly maxTitleLength = 256;
    private static readonly minTitleLength = 3;
    private static readonly maxDescriptionLength = 5000;
    private static readonly userRegex = /\w+@\w+/i;
    private static readonly urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/i;

    static isValid(video: IVideo): boolean {
        return !!video &&
            VideoValidatons.isTitleValid(video.title) &&
            VideoValidatons.isChannelValid(video.channel) &&
            VideoValidatons.isOwnerValid(video.owner) &&
            VideoValidatons.isPathValid(video.contentPath, config.allowedExtensions.videos) &&
            VideoValidatons.isPathValid(video.thumbnailPath, config.allowedExtensions.images);
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

    static isChannelValid(channel: string): boolean {
        const trimmed = channel ? channel.trim() : null;

        return !!trimmed;
    }

    static isDescriptionValid(description: string): boolean {
        const trimmed = description ? description.trim() : '';
        return trimmed.length <= VideoValidatons.maxDescriptionLength;
    }

    static isOwnerValid(owner: string): boolean {
        return VideoValidatons.userRegex.test(owner);
    }

    static isPathValid(path: string, allowedExtensions: string[]) {
        const allowedExtensionsStr = allowedExtensions.join('|');
        const pathRegex = new RegExp(`\\.(${allowedExtensionsStr})$`, 'i');

        return pathRegex.test(path);
    }

    static canChangeStatus(status: VideoStatus, video: IVideo) {
        switch (status) {
            case VideoStatus.READY:
                return !!video.contentPath && !!video.thumbnailPath && !!video.previewPath;
            case VideoStatus.UPLOADED:
                return !!video.originalPath;
            default:
                return true;
        }
    }
}
