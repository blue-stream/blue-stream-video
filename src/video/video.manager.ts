import { IVideo } from './video.interface';
import { VideoRepository } from './video.repository';
import { VideoBroker } from './video.broker';
import { UserClassificationManager } from '../classification/user/user-classification.manager';
import { IClassificationSource } from '../classification/source/classification-source.interface';
import { IUserClassification } from '../classification/user/user-classification.interface';
import { UnauthorizedError, VideoValidationFailedError } from '../utils/errors/userErrors';
import { ClassificationSourceModel } from '../classification/source/classification-source.model';

export class VideoManager implements VideoRepository {
    static async create(video: IVideo) {
        if (video.classificationSource) {
            const source = await ClassificationSourceModel.findById(video.classificationSource);
            if (!source) throw new VideoValidationFailedError();
        }

        return VideoRepository.create(video);
    }

    static createMany(videos: IVideo[]) {
        return VideoRepository.createMany(videos);
    }

    static async updateById(id: string, video: Partial<IVideo>) {
        if (video.classificationSource) {
            const source = await ClassificationSourceModel.findById(video.classificationSource);
            if (!source) throw new VideoValidationFailedError();
        }

        return VideoRepository.updateById(id, video);
    }

    static async deleteById(id: string) {
        const deleted = await VideoRepository.deleteById(id);

        if (deleted) {
            VideoBroker.publishVideoDeleted(deleted.id!);
        }

        return deleted;
    }

    static async getById(userId: string, id: string) {
        const video = await VideoRepository.getById(id);
        if (video && video.classificationSource) {
            const videoClassification = video.classificationSource as IClassificationSource;
            const userClassifications = await UserClassificationManager.getUserClassifications(userId);
            const hasClassifications = userClassifications.some((classification: IUserClassification) => {
                return (
                    classification.classificationId === videoClassification.classificationId &&
                    classification.layer >= videoClassification.layer
                );
            });

            if (!hasClassifications) throw new UnauthorizedError();
        }

        return video;
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

    static async getSearched(
        userId: string,
        searchFilter: string,
        startIndex?: number,
        endIndex?: number,
        sortOrder?: -1 | 1,
        sortBy?: keyof IVideo) {
        const userClassifications = await UserClassificationManager.getUserClassifications(userId);

        return VideoRepository.getSearched(
            userClassifications,
            searchFilter,
            startIndex,
            endIndex,
            sortOrder,
            sortBy,
        );
    }
}
