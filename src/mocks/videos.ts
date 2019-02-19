import { getRandomInt } from '../utils/random';
import { IVideo } from '../video/video.interface';

export function generateVideos(amount: number): IVideo[] {
    return Array.from({ length: amount }, (_, index: number) => {
        const video = {
            channel: `channel-${getRandomInt(0, 20)}`,
            title: `title-${index}`,
            owner: `owner@${index}`,
            description: `description-${index}`,
            classificationSource: getRandomInt(0, 100),
        };

        return video as IVideo;
    });
}
