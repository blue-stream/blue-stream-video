import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { UserClassificationsServiceMock } from '../classification/classification.service.mock';
import { IClassificationSource } from '../classification/source/classification-source.interface';
import { ClassificationSourceModel } from '../classification/source/classification-source.model';
import { config } from '../config';
import { UnauthorizedError, VideoValidationFailedError } from '../utils/errors/userErrors';
import { IVideo } from './video.interface';
import { VideoManager } from './video.manager';
import { VideoModel } from './video.model';
import { PpModel } from '../classification/pp/pp.model';
import { IPp } from '../classification/pp/pp.interface';

describe('Video Manager', function () {
    before(async function () {
        UserClassificationsServiceMock.startMock();
        await mongoose.connect(config.db.connectionString, { useNewUrlParser: true });
    });

    after(async function () {
        UserClassificationsServiceMock.stopMock();
        await mongoose.connection.close();
    });

    afterEach(async function () {
        await VideoModel.deleteMany({}).exec();
        await ClassificationSourceModel.deleteMany({}).exec();
        await PpModel.deleteMany({}).exec();
    });

    describe('#create()', function () {
        context('When data is valid', function () {
            it('Should create video when classification exists', async function () {
                await ClassificationSourceModel.create({ _id: 500000, name: 'a', layer: 1, classificationId: 1 } as IClassificationSource);
                const video = await VideoManager.create({ title: 'title', owner: '2@2', channel: 'a', classificationSource: 500000 } as IVideo);
                expect(video).to.exist;
                expect(video).to.have.property('classificationSource', 500000);
            });

            it('Should create video when pp exists', async function () {
                await PpModel.create({ _id: 10000, type: 'a', name: 'hello' } as IPp);
                await ClassificationSourceModel.create({ _id: 500000, name: 'a', layer: 1, classificationId: 1 } as IClassificationSource);
                const video = await VideoManager.create({ title: 'title', owner: '2@2', channel: 'a', pp: 10000, classificationSource: 500000 } as IVideo);
                expect(video).to.exist;
                expect(video).to.have.property('pp', 10000);
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when requested classification not exists', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.create({ title: 'title', owner: '2@2', channel: 'a', classificationSource: 500000 } as IVideo);
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(VideoValidationFailedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw error when requested pp not exists', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.create({ title: 'title', owner: '2@2', channel: 'a', pp: 10000 } as IVideo);
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(VideoValidationFailedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#updateById()', function () {

        let classifiedVideo: IVideo;

        beforeEach(async function () {
            await ClassificationSourceModel.create({ _id: 1, layer: 1, classificationId: 3, name: 'a' } as IClassificationSource);
            classifiedVideo = await VideoManager.create({ title: 'test', owner: 'a@a', channel: 'a', classificationSource: 1 } as IVideo);
        });

        context('When data is valid', function () {
            it('Should update video when classification exists', async function () {
                await ClassificationSourceModel.create({ _id: 12, name: 'a', layer: 1, classificationId: 1 } as IClassificationSource);
                const video = await VideoManager.updateById(classifiedVideo.id!, { classificationSource: 12 } as IVideo);
                expect(video).to.exist;
                expect(video).to.have.property('classificationSource', 12);
            });

            it('Should update video when pp exists', async function () {
                await PpModel.create({ _id: 1000, name: 'hello', type: 'a' } as IPp);
                await ClassificationSourceModel.create({ _id: 12, name: 'a', layer: 1, classificationId: 1 } as IClassificationSource);
                const video = await VideoManager.updateById(classifiedVideo.id!, { classificationSource: 12, pp: 1000 } as IVideo);
                expect(video).to.exist;
                expect(video).to.have.property('classificationSource', 12);
                expect(video).to.have.property('pp', 1000);
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when requested classification not exists', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.updateById(classifiedVideo.id!, { classificationSource: 500000 } as IVideo);
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(VideoValidationFailedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw error when requested pp not exists', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.updateById(classifiedVideo.id!, { pp: 500000 } as IVideo);
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(VideoValidationFailedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#getById()', function () {
        context('When video is unclassified', function () {
            it('Should return video by id', async function () {
                const newVideo = await VideoManager.create({ title: 'title', owner: 'owner@owner', channel: 'a' } as IVideo);

                const video = await VideoManager.getById(newVideo.id!, 'c@moreThenLittle');
                expect(video).to.exist;
                expect(video).to.have.property('title', 'title');
            });
        });

        context('When video is classified', function () {
            let classifiedVideo: IVideo;
            let classifiedVideoWithPp: IVideo;
            beforeEach(async function () {
                await ClassificationSourceModel.create({ _id: 1, layer: 1, classificationId: 3, name: 'a' } as IClassificationSource);
                await PpModel.create({ _id: 2, type: 'a', name: 'test' });
                classifiedVideo = await VideoManager.create({ title: 'test', owner: 'a@a', channel: 'a', classificationSource: 1 } as IVideo);
                classifiedVideoWithPp = await VideoManager.create({ title: 'test', owner: 'a@a', channel: 'a', classificationSource: 1, pp: 2 } as IVideo);
            });

            it('Should throw error when user doesn\'t have required classification', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.getById(classifiedVideo.id!, 'unknown@user');
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(UnauthorizedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should return video if user has required classifications', async function () {
                const video = await VideoManager.getById(classifiedVideo.id!, 'c@moreThenLittle');
                expect(video).to.exist;
                expect(video).to.have.property('title');
            });

            it('Should throw error when user has classifications but not for correct resource', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.getById(classifiedVideo.id!, 'b@classifications');
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(UnauthorizedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw error when user has classifications to required classificationId but lower layer', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.getById(classifiedVideo.id!, 'l');
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(UnauthorizedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw error when user has required classifications but not required pps', async function () {
                let hasThrown = false;

                try {
                    await VideoManager.getById(classifiedVideoWithPp.id!, 'unknown@user');
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(UnauthorizedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw error when user has required pps but not required classifications', async function () {
                let hasThrown = false;
                await PpModel.create({ _id: 5, name: 'pp', type: 'a' });
                await ClassificationSourceModel.create({ _id: 100, name: 'test', layer: 0, classificationId: 300 });
                const video = await VideoManager.create({ title: 'test', channel: 'abc', owner: 'test@user', pp: 5, classificationSource: 100 } as IVideo);

                try {
                    await VideoManager.getById(video.id!, 'c@moreThenLittle');
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(UnauthorizedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw error when user has correct classificationId but lower layer', async function () {
                let hasThrown = false;
                await PpModel.create({ _id: 5, name: 'pp', type: 'a' });
                await ClassificationSourceModel.create({ _id: 100, name: 'test', layer: 4, classificationId: 3 });
                const video = await VideoManager.create({ title: 'test', channel: 'abc', owner: 'test@user', pp: 5, classificationSource: 100 } as IVideo);

                try {
                    await VideoManager.getById(video.id!, 'c@moreThenLittle');
                } catch (err) {
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(UnauthorizedError);
                    hasThrown = true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should return video when user has both pp and classification required', async function () {
                await PpModel.create({ _id: 5, name: 'pp', type: 'a' });
                await ClassificationSourceModel.create({ _id: 100, name: 'test', layer: 2, classificationId: 7 });
                const video = await VideoManager.create({ title: 'test', channel: 'abc', owner: 'test@user', pp: 5, classificationSource: 100 } as IVideo);

                const fetchedVideo = await VideoManager.getById(video.id!, 'c@moreThenLittle');

                expect(fetchedVideo).to.exist;
                expect(fetchedVideo).to.have.property('pp').which.has.property('_id', 5);
                expect(fetchedVideo).to.have.property('classificationSource').which.has.property('classificationId', 7);
            });
        });
    });
});
