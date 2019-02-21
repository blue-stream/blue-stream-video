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
            tags: [`tag-${i % 5 === 0 ? 'special' : 'normal'}-i`, `tag-${i}`],
        } as IVideo);
    }

    return videos;
}
