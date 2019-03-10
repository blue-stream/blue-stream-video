import { Types } from 'mongoose';
import { IVideo, VideoStatus } from '../video.interface';
import { config } from '../../config';

export class VideoValidatons {

    static isValid(video: IVideo): boolean {
        return !!video &&
            VideoValidatons.isTitleValid(video.title) &&
            VideoValidatons.isChannelValid(video.channel) &&
            VideoValidatons.isOwnerValid(video.owner) &&
            VideoValidatons.isPathValid(video.contentPath, config.allowedExtensions.videos) &&
            VideoValidatons.isPathValid(video.thumbnailPath, config.allowedExtensions.images) &&
            VideoValidatons.isClassificationsValid(video.classificationSource as number, video.pp as number);
    }

    static isIdValid(id: string): boolean {
        return Types.ObjectId.isValid(id);
    }

    static isTitleValid(title: string): boolean {
        const trimmed = title ? title.trim() : null;
        return (
            !!trimmed &&
            trimmed.length <= config.validations.maxTitleLength &&
            trimmed.length >= config.validations.minTitleLength
        );
    }

    static isChannelValid(channel: string): boolean {
        const trimmed = channel ? channel.trim() : null;

        return !!trimmed;
    }

    static isDescriptionValid(description: string): boolean {
        const trimmed = description ? description.trim() : '';
        return trimmed.length <= config.validations.maxDescriptionLength;
    }

    static isOwnerValid(owner: string): boolean {
        return config.validations.userRegex.test(owner);
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

    static isClassificationsValid(source?: number, pp?: number): boolean {
        return !!(!pp || source);
    }
}
