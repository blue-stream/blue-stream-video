import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../config';
import { IView } from './view.interface';
import { ViewManager } from './view.manager';
import { ViewModel } from './view.model';
import { ViewRepository } from './view.repository';
import { VideoModel } from '../video/video.model';
import { IVideo } from '../video/video.interface';
import { VideoNotFoundError } from '../utils/errors/userErrors';

const ObjectId = mongoose.Types.ObjectId;

const id1 = new ObjectId();
const id2 = new ObjectId();

const view = {
    video: id1,
    user: 'user@domain',
};

const views: Partial<IView>[] = [
    {
        video: id2,
        user: '1@1',
    },
    {
        video: id2,
        user: '2@2',
    },
    {
        video: id1,
        user: '1@1',
    },
    {
        video: id1,
        user: '2@2',
    },
];

describe('View Manager', function () {
    before(async function () {
        mongoose.set('useCreateIndex', true);
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await VideoModel.deleteMany({}).exec();
        await ViewModel.deleteMany({}).exec();
    });

    after(async function () {
        await mongoose.connection.close();
    });

    describe('#addView', function () {
        context('When data is valid', function () {
            let video: IVideo;
            let videoId: mongoose.Types.ObjectId;

            beforeEach(async function () {
                video = await VideoModel.create({
                    title: 'test',
                    owner: 'user@dom',
                });
                videoId = ObjectId(video.id);
            });

            it('Should add new view to db', async function () {
                let _view;

                _view = await ViewRepository.getOne(videoId, view.user);
                expect(_view).to.not.exist;

                await ViewManager.addView(videoId, view.user);

                _view = await ViewRepository.getOne(videoId, view.user);
                expect(_view).to.exist;
                expect(_view).to.have.property('user', view.user);
                expect(_view).to.have.property('lastViewDate');
                expect(_view).to.have.property('video');
                expect(_view!.video.equals(videoId)).to.be.true;
            });

            it('Should not change view\'s amount if `viewDebounceDuration` did not pass', async function () {

                // Create the view
                await ViewManager.addView(videoId, view.user);

                // Try to increase amount
                await ViewManager.addView(videoId, view.user);

                const _view = await ViewRepository.getOne(videoId, view.user);
                expect(_view).to.exist;
                expect(_view).to.have.property('amount', 1);
            });

            it('Should change view\'s amount if `viewDebounceDuration` passed', async function () {

                // Create the view
                await ViewManager.addView(videoId, view.user);

                const originalDateNow = Date.now;

                // Mock Date.now() function to return time + `viewDebounceDuration`
                Date.now = () => {
                    return originalDateNow() + config.viewDebounceDuration * 60 * 1000;
                };

                const viewPromises = [];
                for (let i = 0; i < 10; i++) {
                    viewPromises.push(ViewManager.addView(videoId, view.user));
                }

                await Promise.all(viewPromises);

                const _view = await ViewRepository.getOne(videoId, view.user);
                expect(_view).to.exist;
                expect(_view).to.have.property('amount', viewPromises.length + 1);

                Date.now = originalDateNow;
            });

            it('Should throw error when video not exists', async function () {
                let hasThrown = false;

                try {
                    await ViewManager.addView(new ObjectId(), 'random@user');
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.be.instanceOf(VideoNotFoundError);
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#getUserViewedVideos', function () {
        beforeEach(async function () {
            await Promise.all(views.map(v => ViewRepository.create(v.video!, v.user!)));
        });

        it('Should return videos that the user has viewed', async function () {
            const _views = await ViewManager.getUserViewedVideos('1@1');
            expect(_views).to.exist;
            expect(_views).to.be.an('array');

            const existingViews = views.filter(v => v.user === '1@1');

            expect(_views).to.have.lengthOf(existingViews.length);
            const originalIds = existingViews.map(v => v.video!.toHexString());
            expect(_views).to.have.members(originalIds);
        });

        it('Should return empty array if user don\'nt have any views', async function () {
            const views = await ViewManager.getUserViewedVideos('13@13');
            expect(views).to.exist;
            expect(views).to.be.an('array');
            expect(views).to.have.lengthOf(0);
        });
    });
});
