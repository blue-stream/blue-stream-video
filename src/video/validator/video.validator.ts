import { NextFunction, Request, Response } from 'express';
import { IdInvalidError, VideoValidationFailedError } from '../../utils/errors/userErrors';
import { IVideo } from '../video.interface';
import { VideoValidatons } from './video.validations';

export class VideoValidator {

    static canCreate(req: Request, res: Response, next: NextFunction) {
        next(VideoValidator.validateVideo(req.body.video));
    }

    static canUpdateById(req: Request, res: Response, next: NextFunction) {
        next(
            VideoValidator.validateId(req.params.id) ||
            VideoValidator.validatePartialVideo(req.body.video));
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

    private static validateVideo(video: IVideo) {
        if (!VideoValidatons.isTitleValid(video.title)) return new VideoValidationFailedError('title');
        if (!VideoValidatons.isOwnerValid(video.owner)) return new VideoValidationFailedError('owner');
        if (!VideoValidatons.isUrlValid(video.thumbnailUrl)) return new VideoValidationFailedError('thumbnailUrl');
        if (!VideoValidatons.isUrlValid(video.contentUrl)) return new VideoValidationFailedError('contentUrl');

        return undefined;
    }

    private static validatePartialVideo(video: Partial<IVideo>) {
        if (video.contentUrl && !VideoValidatons.isUrlValid(video.contentUrl)) return new VideoValidationFailedError('contentUrl');
        if (video.thumbnailUrl && !VideoValidatons.isUrlValid(video.thumbnailUrl)) return new VideoValidationFailedError('thumbnailUrl');
        if (video.title && !VideoValidatons.isTitleValid(video.title)) return new VideoValidationFailedError('title');
        if (video.owner && !VideoValidatons.isUrlValid(video.owner)) return new VideoValidationFailedError('owner');

        return undefined;
    }

    private static validateId(id: string) {
        if (!VideoValidatons.isIdValid(id)) {
            return new IdInvalidError();
        }

        return undefined;
    }
}
