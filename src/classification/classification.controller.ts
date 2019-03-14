import { Request, Response } from 'express';
import { ClassificationManager } from './classification.manager';

export class ClassificationController {
    static async userSourcesSearch(req: Request, res: Response) {
        res.json(await ClassificationManager.getUserSources(req.user.id, req.query.searchFilter, req.user.isSysAdmin));
    }

    static async userPpsSearch(req: Request, res: Response) {
        res.json(await ClassificationManager.getUserPps(req.user.id, req.query.searchFilter, req.user.isSysAdmin));
    }
}
