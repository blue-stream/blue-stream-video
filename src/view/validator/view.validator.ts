import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { IdInvalidError } from '../../utils/errors/userErrors';

export class ViewValidator {

    static canView(req: Request, res: Response, next: NextFunction) {
        if (Types.ObjectId.isValid(req.params.video)) {
            return next();
        }

        return next(new IdInvalidError());
    }
}
