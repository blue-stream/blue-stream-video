import { ViewManager } from '../view/view.manager';
import { VideoManager } from '../video/video.manager';
import { IVideo } from '../video/video.interface';
const jayson = require('jayson/promise');

export const RPCServer = new jayson.Server({
    async getChannelsViews(channels: string[]) {
        const channelViews = await ViewManager.getChannelsViews(channels);

        return channelViews;
    },

    async getVideos(videosIds: string[], userId: string, isSysAdmin: boolean) {
        const videos: IVideo[] | null = await VideoManager.getByIds(videosIds, userId, isSysAdmin);

        const videosMap: { [id: string]: IVideo } = {};

        if (videos) {
            videos.forEach((video: IVideo) => {
                videosMap[video.id!] = video;
            });
        }

        return videosMap;
    },
});
