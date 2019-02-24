import { IVideo } from '../video/video.interface';
import { getClassificationSources } from './classificationSources';

export function getVideos(): IVideo[] {
    const classificationSources = getClassificationSources();
    const videos: IVideo[] = [];

    for (let i = 0; i < classificationSources.length; i++) {
        videos.push({
            channel: `channel-${i % 3}`,
            classificationSource: i + 1,
            title: `title-${i}`,
            owner: `owner@${i}`,
            description: `description-${i}`,
            tags: [`tag-${i % 5 === 0 ? 'special' : 'normal'}-i`, `tag-${i}`],
        } as IVideo);
    }

    videos.push({
        channel: 'channel-2',
        title: 'title-no-permission',
        owner: 'owner@owner',
        description: 'description',
        tags: ['tag'],
    } as IVideo);

    return videos;
}
