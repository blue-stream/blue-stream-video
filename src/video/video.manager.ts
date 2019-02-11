import { IVideo } from './video.interface';
import { VideoRepository } from './video.repository';
import { VideoBroker } from './video.broker';

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

    static getMany(videoFilter: Partial<IVideo>) {
        return VideoRepository.getMany(videoFilter);
    }

    static getAmount(videoFilter: Partial<IVideo>) {
        return VideoRepository.getAmount(videoFilter);
    }

    static getSearched(
        searchFilter: string,
        startIndex?: number,
        endIndex?: number,
        sortOrder?: '-' | '',
        sortBy?: string) {
        return VideoRepository.getSearched(searchFilter, startIndex, endIndex, sortOrder, sortBy);
    }

    static getSearchedAmount(searchFilter: string) {
        return VideoRepository.getSearchedAmount(searchFilter);
    }
}
