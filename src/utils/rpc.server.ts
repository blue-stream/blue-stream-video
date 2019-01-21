import { ViewManager } from '../view/view.manager';
const jayson = require('jayson/promise');

export const RPCServer = new jayson.Server({
    async getChannelViews(channels: string[]) {
        const channelViews = await ViewManager.getChannelViews(channels);

        return channelViews;
    },
});
