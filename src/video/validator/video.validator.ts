import { NextFunction, Request, Response } from 'express';
import { IdInvalidError, VideoValidationFailedError } from '../../utils/errors/userErrors';
import { IVideo } from '../video.interface';
import { VideoValidatons } from './video.validations';
import { config } from '../../config';

export class VideoValidator {

    static canCreate(req: Request, res: Response, next: NextFunction) {
        const { user } = req;
        req.body.owner = user ? user.id : null;
        next(VideoValidator.validateVideo(req.body));
    }

    static canUpdateById(req: Request, res: Response, next: NextFunction) {
        delete req.body.owner;
        delete req.body.contentPath;
        delete req.body.thumbnailPath;
        delete req.body.previewPath;
        delete req.body.originalPath;
        delete req.body.status;
        delete req.body.views;
        delete req.body.channel;

        next(
            VideoValidator.validateId(req.params.id) ||
            VideoValidator.validatePartialVideo(req.body));
    }

    static canDeleteById(req: Request, res: Response, next: NextFunction) {
        next(VideoValidator.validateId(req.params.id));
    }

    static canGetById(req: Request, res: Response, next: NextFunction) {
        next(VideoValidator.validateId(req.params.id));
    }

    static canGetOne(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetMany(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetAmount(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetSearched(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetSearchedAmount(req: Request, res: Response, next: NextFunction) {
        next();
    }

    private static validateVideo(video: IVideo) {
        if (!VideoValidatons.isTitleValid(video.title)) return new VideoValidationFailedError('title');
        if (!VideoValidatons.isChannelValid(video.channel)) return new VideoValidationFailedError('channel');
        if (!VideoValidatons.isOwnerValid(video.owner)) return new VideoValidationFailedError('owner');
        if (!VideoValidatons.isDescriptionValid(video.description)) return new VideoValidationFailedError('description');
        if (video.thumbnailPath && !VideoValidatons.isPathValid(video.thumbnailPath, config.allowedExtensions.images)) return new VideoValidationFailedError('thumbnailPath');
        if (video.contentPath && !VideoValidatons.isPathValid(video.contentPath, ['mp4'])) return new VideoValidationFailedError('contentPath');
        if (video.originalPath && !VideoValidatons.isPathValid(video.originalPath, config.allowedExtensions.videos)) return new VideoValidationFailedError('originalPath');
        if (video.previewPath && !VideoValidatons.isPathValid(video.previewPath, config.allowedExtensions.previews)) return new VideoValidationFailedError('previewPath');
        if (video.status && !VideoValidatons.canChangeStatus(video.status, video)) return new VideoValidationFailedError('status');

        return undefined;
    }

    private static validatePartialVideo(video: Partial<IVideo>) {
        if (video.contentPath && !VideoValidatons.isPathValid(video.contentPath, ['mp4'])) return new VideoValidationFailedError('contentPath');
        if (video.thumbnailPath && !VideoValidatons.isPathValid(video.thumbnailPath, config.allowedExtensions.images)) return new VideoValidationFailedError('thumbnailPath');
        if (video.originalPath && !VideoValidatons.isPathValid(video.originalPath, config.allowedExtensions.videos)) return new VideoValidationFailedError('originalPath');
        if (video.previewPath && !VideoValidatons.isPathValid(video.previewPath, config.allowedExtensions.previews)) return new VideoValidationFailedError('previewPath');
        if (video.title && !VideoValidatons.isTitleValid(video.title)) return new VideoValidationFailedError('title');
        if (video.channel && !VideoValidatons.isChannelValid(video.channel)) return new VideoValidationFailedError('channel');
        if (video.owner && !VideoValidatons.isOwnerValid(video.owner)) return new VideoValidationFailedError('owner');
        if (video.description && !VideoValidatons.isDescriptionValid(video.description)) return new VideoValidationFailedError('description');
        if (video.status && !VideoValidatons.canChangeStatus(video.status, video as IVideo)) return new VideoValidationFailedError('status');

        return undefined;
    }

    private static validateId(id: string) {
        if (!VideoValidatons.isIdValid(id)) {
            return new IdInvalidError();
        }

        return undefined;
    }
}
