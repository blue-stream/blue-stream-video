import { IVideo, VideoStatus } from './video.interface';
import { VideoRepository } from './video.repository';
import { VideoBroker } from './video.broker';
import { IClassificationSource } from '../classification/source/classification-source.interface';
import { IUserClassification } from '../classification/user-classification/user-classification.interface';
import { UnauthorizedError, VideoValidationFailedError } from '../utils/errors/userErrors';
import { ClassificationSourceModel } from '../classification/source/classification-source.model';
import { ClassificationManager } from '../classification/classification.manager';
import { PpModel } from '../classification/pp/pp.model';
import { IPp } from '../classification/pp/pp.interface';

export class VideoManager implements VideoRepository {
    static async create(video: IVideo) {
        await VideoManager.verifyClassifications(video.classificationSource as number, video.pp as number);

        return VideoRepository.create(video);
    }

    static createMany(videos: IVideo[]) {
        return VideoRepository.createMany(videos);
    }

    static async updateById(id: string, video: Partial<IVideo>, userId?: string) {
        await VideoManager.verifyClassifications(video.classificationSource as number, video.pp as number);

        if (video.contentPath) {
            const currentVideo = await VideoRepository.getById(id);

            if (currentVideo && currentVideo.contentPath) {
                VideoBroker.publishVideoFileReplaced(
                    id,
                    userId || '',
                    currentVideo.contentPath,
                    currentVideo.previewPath || '',
                    currentVideo.thumbnailPath);
            }
        }

        return VideoRepository.updateById(id, video);
    }

    static async deleteById(id: string, requestingUser?: string) {
        const deletedVideo = await VideoRepository.deleteById(id);

        if (deletedVideo) {
            VideoBroker.publishVideoDeleted(deletedVideo.id!, requestingUser || '', deletedVideo.contentPath!, deletedVideo.previewPath!, deletedVideo.thumbnailPath!);
        }

        return deletedVideo;
    }

    static async getById(id: string, userId: string, isSysAdmin: boolean = false) {
        const video = await VideoRepository.getById(id);

        if (isSysAdmin) return video;
        if (video && video.classificationSource) {
            if (video.published === false && video.owner !== userId) throw new UnauthorizedError();

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
                hasPps = userClassifications.pps.some(pp => pp.ppId === (video.pp as IPp)._id);
            }

            if (!hasClassifications || !hasPps) throw new UnauthorizedError();
        }

        return video;
    }

    static async getByIds(ids: string[], userId: string, isSysAdmin: boolean = false) {
        const videos = await VideoRepository.getByIds(ids);

        if (isSysAdmin) return videos;

        if (!videos) return [];

        const videosToReturn: IVideo[] = [];
        const userClassifications = await ClassificationManager.getClassifications(userId);

        videos.forEach(video => {
            let includeVideo: boolean = true;
            let hasClassifications: boolean = true;
            let hasPps: boolean = true;

            if (video) {
                if (video.classificationSource) {
                    const videoClassification = video.classificationSource as IClassificationSource;
                    hasClassifications = userClassifications.classifications.some((classification: IUserClassification) => {
                        return (
                            classification.classificationId === videoClassification.classificationId &&
                            classification.layer >= videoClassification.layer
                        );
                    });
                }

                if (video.pp) {
                    hasPps = userClassifications.pps.some(pp => pp.ppId === (video.pp as IPp)._id);
                } else {
                    hasPps = true;
                }

                if (!hasClassifications || !hasPps) {
                    includeVideo = false;
                }
            }

            if (includeVideo) {
                videosToReturn.push(video);
            }
        });

        return videosToReturn;
    }

    static async isVideoPublished(videoId: string) {
        const video = await VideoRepository.getById(videoId);

        return (video && video.status === VideoStatus.READY);
    }

    static getOne(videoFilter: Partial<IVideo>) {
        return VideoRepository.getOne(videoFilter);
    }

    static async getMany(userId: string, isSysAdmin: boolean = false, videoFilter: Partial<IVideo>, startIndex: number, endIndex: number, sortOrder: -1 | 1, sortBy: keyof IVideo) {
        const classifications = await ClassificationManager.getClassifications(userId);
        let filter = videoFilter;
        if (userId !== videoFilter.owner) filter = { ...videoFilter, published: true, status: VideoStatus.READY };
        return VideoRepository.getMany(filter, classifications, isSysAdmin, startIndex, endIndex, sortOrder, sortBy);
    }

    static getAmount(videoFilter: Partial<IVideo>) {
        return VideoRepository.getAmount(videoFilter);
    }

    static async getSearched(
        userId: string,
        isSysAdmin: boolean = false,
        searchFilter: string,
        startIndex?: number,
        endIndex?: number,
        sortOrder?: -1 | 1,
        sortBy?: keyof IVideo) {
        const classifications = await ClassificationManager.getClassifications(userId);

        return VideoRepository.getSearched(
            classifications,
            isSysAdmin,
            searchFilter,
            startIndex,
            endIndex,
            sortOrder,
            sortBy,
            { published: true, status: VideoStatus.READY },
        );
    }

    static async getPopularTags(startIndex?: number, endIndex?: number) {
        const tags = await VideoRepository.getPopularTags(startIndex, endIndex);

        return tags.map(t => t.id);
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
