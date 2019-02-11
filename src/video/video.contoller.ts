import { Request, Response } from 'express';
import { VideoNotFoundError } from '../utils/errors/userErrors';
import { VideoManager } from './video.manager';

export class VideoController {
    static async create(req: Request, res: Response) {
        res.json(await VideoManager.create(req.body));
    }

    static async updateById(req: Request, res: Response) {
        const updated = await VideoManager.updateById(req.params.id, req.body);
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

    static async getSearched(req: Request, res: Response) {
        res.json(await VideoManager.getSearched(req.query.searchFilter, req.query.startIndex, req.query.endIndex, req.query.sortOrder, req.query.sortBy));
    }

    static async getSearchedAmount(req: Request, res: Response) {
        res.json(await VideoManager.getSearchedAmount(req.query.searchFilter));
    }

}
