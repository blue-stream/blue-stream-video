import { IVideo } from '../video/video.interface';
import { getClassificationSources } from './classificationSources';

export function getVideos(): IVideo[] {
    const classificationSources = getClassificationSources();
    const videos: IVideo[] = [];

    for (let i = 0; i < classificationSources.length; i++) {
        videos.push({
            channel: `channel-${i % 3}`,
            classificationSource: i,
            title: `title-${i}`,
            owner: `owner@${i}`,
            description: `description-${i}`,
        } as IVideo);
    }

    return videos;
}
