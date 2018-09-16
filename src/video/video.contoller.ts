import { Request, Response } from 'express';
import { VideoManager } from './video.manager';
import { VideoNotFoundError } from '../utils/errors/userErrors';
import { UpdateWriteOpResult } from 'mongodb';

type UpdateResponse = UpdateWriteOpResult['result'];
export class VideoController {
    static async create(req: Request, res: Response) {
        res.json(await VideoManager.create(req.body.video));
    }

    static async updateById(req: Request, res: Response) {
        const updated = await VideoManager.updateById(req.params.id, req.body.video);
        if (!updated) {
            throw new VideoNotFoundError();
        }

        res.json(updated);
    }

    static async deleteById(req: Request, res: Response) {
        const deleted = await VideoManager.deleteById(req.params.id);
        if (!deleted) {
            throw new VideoNotFoundError();
        }

        res.json(deleted);
    }

    static async getById(req: Request, res: Response) {
        const video = await VideoManager.getById(req.params.id);
        if (!video) {
            throw new VideoNotFoundError();
        }

        res.json(video);
    }

    static async getOne(req: Request, res: Response) {
        const video = await VideoManager.getOne(req.query);
        if (!video) {
            throw new VideoNotFoundError();
        }

        res.json(video);
    }

    static async getMany(req: Request, res: Response) {
        res.json(await VideoManager.getMany(req.query));
    }

    static async getAmount(req: Request, res: Response) {
        res.json(await VideoManager.getAmount(req.query));
    }
}
