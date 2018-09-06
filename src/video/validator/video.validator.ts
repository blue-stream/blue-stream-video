import { Request, Response, NextFunction } from 'express';
import { VideoValidatons } from './video.validations';
import { PropertyInvalidError, IdInvalidError } from '../../utils/errors/userErrors';
import { IVideo } from '../video.interface';

export class VideoValidator {

    static canCreate(req: Request, res: Response, next: NextFunction) {
        next(VideoValidator.validateProperty(req.body.video.property));
    }

    static canCreateMany(req: Request, res: Response, next: NextFunction) {
        const propertiesValidations: (Error | undefined)[] = req.body.videos.map((video: IVideo) => {
            return VideoValidator.validateProperty(video.property);
        });

        next(VideoValidator.getNextValueFromArray(propertiesValidations));
    }

    static canUpdateById(req: Request, res: Response, next: NextFunction) {
        next(
            VideoValidator.validateId(req.params.id) ||
            VideoValidator.validateProperty(req.body.video.property));
    }

    static canUpdateMany(req: Request, res: Response, next: NextFunction) {
        next(VideoValidator.validateProperty(req.body.video.property));
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

    private static validateProperty(property: string) {
        if (!VideoValidatons.isPropertyValid(property)) {
            return new PropertyInvalidError();
        }

        return undefined;
    }

    private static validateId(id: string) {
        if (!VideoValidatons.isIdValid(id)) {
            return new IdInvalidError();
        }

        return undefined;
    }

    private static getNextValueFromArray(validationsArray: (Error | undefined)[]) {
        let nextValue: Error | undefined;

        for (let index = 0; index < validationsArray.length; index++) {
            if (validationsArray[index] !== undefined) {
                nextValue = validationsArray[index];
            }
        }

        return nextValue;
    }
}
