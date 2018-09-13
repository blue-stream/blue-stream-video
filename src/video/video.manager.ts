import { IVideo } from './video.interface';
import { VideoRepository } from './video.repository';

export class VideoManager implements VideoRepository {
    static create(video: IVideo) {
        return VideoRepository.create(video);
    }

    static updateById(id: string, video: Partial<IVideo>) {
        return VideoRepository.updateById(id, video);
    }

    static deleteById(id: string) {
        return VideoRepository.deleteById(id);
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
}
