import { config } from '../config';
import { VideoRepository } from '../video/video.repository';
import { IView } from './view.interface';
import { ViewRepository } from './view.repository';
import { Types } from 'mongoose';
import { VideoManager } from '../video/video.manager';
import { VideoNotFoundError } from '../utils/errors/userErrors';

type ObjectId = Types.ObjectId;

export class ViewManager {

    static async addView(video: ObjectId, user: string): Promise<void> {
        const view = await ViewRepository.getOne(video, user);
        let canView = false;

        if (!view) {
            const vid = await VideoManager.getById(video.toHexString());
            if (!vid) throw new VideoNotFoundError();

            canView = !!vid;
        } else if (ViewManager.shouldIncreaseView(view)) {
            canView = true;
        }

        if (canView) {
            await ViewRepository.increaseView(video, user);
            await VideoRepository.increaseViews(video.toHexString());
        }
    }

    private static shouldIncreaseView(view: IView) {
        const now = Date.now();
        const diff = Math.abs(now - view.lastViewDate.getTime());
        const minutesDiff = Math.floor((diff / 1000) / 60);

        return minutesDiff >= config.viewDebounceDuration;
    }

    static async getUserViewedVideos(user: string): Promise<string[]> {
        const views = await ViewRepository.getMany({ user });

        if (views) {
            return views.map(view => view.video.toHexString());
        }

        return [];
    }
}
