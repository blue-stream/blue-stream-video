import { ViewManager } from '../view/view.manager';
const jayson = require('jayson/promise');

export const RPCServer = new jayson.Server({
    async getChannelsViews(channels: string[]) {
        const channelViews = await ViewManager.getChannelsViews(channels);

        return channelViews;
    },
});
