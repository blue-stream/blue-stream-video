import { IVideo, VideoStatus } from './video.interface';
import { VideoRepository } from './video.repository';
import { VideoBroker } from './video.broker';
import { IClassificationSource } from '../classification/source/classification-source.interface';
import { IUserClassification } from '../classification/user-classification/user-classification.interface';
import { UnauthorizedError, VideoValidationFailedError } from '../utils/errors/userErrors';
import { ClassificationSourceModel } from '../classification/source/classification-source.model';
import { ClassificationManager } from '../classification/classification.manager';
import { PpModel } from '../classification/pp/pp.model';

export class VideoManager implements VideoRepository {
    static async create(video: IVideo) {
        await VideoManager.verifyClassifications(video.classificationSource as number, video.pp as number);

        return VideoRepository.create(video);
    }

    static createMany(videos: IVideo[]) {
        return VideoRepository.createMany(videos);
    }

    static async updateById(id: string, video: Partial<IVideo>) {
        await VideoManager.verifyClassifications(video.classificationSource as number, video.pp as number);

        return VideoRepository.updateById(id, video);
    }

    static async deleteById(id: string) {
        const deleted = await VideoRepository.deleteById(id);

        if (deleted) {
            VideoBroker.publishVideoDeleted(deleted.id!);
        }

        return deleted;
    }

    static async getById(id: string, userId: string) {
        const video = await VideoRepository.getById(id);
        if (video && video.classificationSource) {
            const videoClassification = video.classificationSource as IClassificationSource;
            const userClassifications = await ClassificationManager.getClassifications(userId);
            const hasClassifications = userClassifications.classifications.some((classification: IUserClassification) => {
                return (
                    classification.classificationId === videoClassification.classificationId &&
                    classification.layer >= videoClassification.layer
                );
            });

            let hasPps: boolean;

            if (!video.pp) {
                hasPps = true;
            } else {
                hasPps = userClassifications.pps.some(pp => pp.ppId === video.pp);
            }

            if (!hasClassifications || !hasPps) throw new UnauthorizedError();
        }

        return video;
    }

    static getOne(videoFilter: Partial<IVideo>) {
        return VideoRepository.getOne(videoFilter);
    }

    static async getMany(userId: string, videoFilter: Partial<IVideo>) {
        const classifications = await ClassificationManager.getClassifications(userId);
        let filter = videoFilter;
        if (userId !== videoFilter.owner) filter = { ...videoFilter, published: true, status: VideoStatus.READY };
        return VideoRepository.getMany(filter, classifications);
    }

    static getAmount(videoFilter: Partial<IVideo>) {
        return VideoRepository.getAmount(videoFilter);
    }

    static async getSearched(
        userId: string,
        searchFilter: string,
        startIndex?: number,
        endIndex?: number,
        sortOrder?: -1 | 1,
        sortBy?: keyof IVideo) {
        const classifications = await ClassificationManager.getClassifications(userId);

        return VideoRepository.getSearched(
            classifications,
            searchFilter,
            startIndex,
            endIndex,
            sortOrder,
            sortBy,
            { published: true, status: VideoStatus.READY },
        );
    }

    private static async verifyClassifications(source?: number, pp?: number) {
        if (source) {
            const fetchedSource = await ClassificationSourceModel.findById(source);
            if (!fetchedSource) throw new VideoValidationFailedError();
        }

        if (pp) {
            const fetchedPp = await PpModel.findById(pp);
            if (!fetchedPp) throw new VideoValidationFailedError();
        }
    }
}
