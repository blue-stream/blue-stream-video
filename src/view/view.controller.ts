import { Request, Response } from 'express';
import { ViewManager } from './view.manager';
import { Types } from 'mongoose';

export class ViewController {

    static async addView(req: Request, res: Response) {
        const video = new Types.ObjectId(req.params.video);
        return res.json(await ViewManager.addView(video, req.user.id));
    }

    static async getViewedVideos(req: Request, res: Response) {
        return res.json(await ViewManager.getUserViewedVideos(req.user.id));
    }
}