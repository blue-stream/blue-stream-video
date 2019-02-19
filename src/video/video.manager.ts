import { IVideo } from './video.interface';
import { VideoRepository } from './video.repository';
import { VideoBroker } from './video.broker';
import { UserClassificationManager } from '../user-classification/user-classification.manager';

export class VideoManager implements VideoRepository {
    static create(video: IVideo) {
        return VideoRepository.create(video);
    }

    static createMany(videos: IVideo[]) {
        return VideoRepository.createMany(videos);
    }

    static updateById(id: string, video: Partial<IVideo>) {
        return VideoRepository.updateById(id, video);
    }

    static async deleteById(id: string) {
        const deleted = await VideoRepository.deleteById(id);

        if (deleted) {
            VideoBroker.publishVideoDeleted(deleted.id!);
        }

        return deleted;
    }

    static getById(id: string) {
        return VideoRepository.getById(id);
    }

    static getOne(videoFilter: Partial<IVideo>) {
        return VideoRepository.getOne(videoFilter);
    }

    static async getMany(userId: string, videoFilter: Partial<IVideo>) {
        const userClassifications = await UserClassificationManager.getUserClassifications(userId);
        return VideoRepository.getMany(videoFilter, userClassifications);
    }

    static getAmount(videoFilter: Partial<IVideo>) {
        return VideoRepository.getAmount(videoFilter);
    }
}
