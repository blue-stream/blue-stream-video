import { Request, Response } from 'express';
import { VideoNotFoundError } from '../utils/errors/userErrors';
import { VideoManager } from './video.manager';
import { IVideo } from './video.interface';

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
        const video = await VideoManager.getById(req.params.id, req.user.id, req.user.isSysAdmin);
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
        const videoFilter: Partial<IVideo> = {
            channel: req.query.channel,
            title: req.query.title,
            description: req.query.description,
            owner: req.query.owner,
            published: req.query.published,
            tags: req.query.tags,
        };

        Object.keys(videoFilter).forEach((key: string) => {
            return videoFilter[key as keyof IVideo] ===
                undefined && delete videoFilter[key as keyof IVideo];
        });

        const sortOrder: -1 | 1 = Number(req.query.sortOrder) as (1 | -1);
        const sortBy: keyof IVideo = req.query.sortBy;
        const startIndex: number = Number(req.query.startIndex);
        const endIndex: number = Number(req.query.endIndex);

        res.json(await VideoManager.getMany(req.user.id, req.user.isSysAdmin, videoFilter, startIndex, endIndex, sortOrder, sortBy));
    }

    static async getAmount(req: Request, res: Response) {
        res.json(await VideoManager.getAmount(req.query));
    }

    static async getSearched(req: Request, res: Response) {
        res.json(await VideoManager.getSearched(
            req.user.id,
            req.user.isSysAdmin,
            req.query.searchFilter,
            req.query.startIndex,
            req.query.endIndex,
            req.query.sortOrder,
            req.query.sortBy,
        ));
    }

    static async getPopularTags(req: Request, res: Response) {
        res.json(await VideoManager.getPopularTags(
            req.query.startIndex,
            req.query.endIndex,
        ));
    }
}
