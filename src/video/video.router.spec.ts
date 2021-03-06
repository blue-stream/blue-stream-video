import { expect } from 'chai';
import { sign } from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { config } from '../config';
import { Server } from '../server';
import { IdInvalidError, VideoNotFoundError, VideoValidationFailedError, UnauthorizedError } from '../utils/errors/userErrors';
import { IVideo, VideoStatus } from './video.interface';
import { VideoManager } from './video.manager';
import * as rabbit from '../utils/rabbit';
import { VideoModel } from './video.model';
import { ClassificationSourceModel } from '../classification/source/classification-source.model';
import { IClassificationSource } from '../classification/source/classification-source.interface';

describe('Video Module', function () {
    let server: Server;
    const validProppertyString: string = '12345';
    const video: IVideo = {
        contentPath: 'YkgkThdzX-8.mp4',
        description: 'John Lennon',
        owner: 'user@domain',
        title: 'Imagine - John Lennon',
        thumbnailPath: 'ACSszfE1bmbrfGYUWaNbkn1UWPiwKiQzOJ0it.png',
        channel: 'Music',
    };

    const authorizationHeader = `Bearer ${sign({ id: 'user@domain' }, config.authentication.secret)}`;
    const invalidId: string = '1';
    const invalidVideo: IVideo = {
        title: 'a'.repeat(300),
        owner: 'owner',
        contentPath: '',
        thumbnailPath: '',
        description: '',
        channel: '',
    };

    const video2: IVideo = {
        title: 'BOB DYLAN - Mr Tambourine Man',
        description: `Subterranean Homesick Blues: A Tribute to Bob Dylan's 'Bringing It All Back Home'`,
        owner: 'bob@dylan',
        contentPath: 'PYF8Y47qZQY.mp4',
        thumbnailPath: 'w8qfEEDmQ.jpg',
        channel: 'Music',
    };

    const video3: IVideo = {
        title: 'OFFICIAL Somewhere over the Rainbow - Israel "IZ" Kamakawiwoʻole',
        description: `Israel "IZ" Kamakawiwoʻole's Platinum selling hit "Over the Rainbow" OFFICIAL video produced by Jon de Mello for The Mountain Apple Company • HAWAI`,
        owner: 'mountain@apple',
        contentPath: 'V1bFr2SWP1I.mp4',
        thumbnailPath: 'AN66SAxZyTsOYDydiDuDzlWvf4cXAxD.jpeg',
        channel: 'Music',
    };

    const unexistingVideo: Partial<IVideo> = {
        title: 'a',
    };

    const updateVideo: Partial<IVideo> = {
        title: 'updated value',
    };

    const videos: IVideo[] =
        [video, video2, video3, video3];

    const publicVideos = videos.map((video) => {
        video.previewPath = 'AN66SAxZyTsOYDydiDuDzlWvf4cXAxD.gif';
        video.status = VideoStatus.READY;
        video.published = true;
        return video;
    });

    before(async function () {
        await rabbit.connect();
        await mongoose.connect(config.db.connectionString, { useNewUrlParser: true });
        server = Server.bootstrap();
    });

    after(async function () {
        await VideoModel.deleteMany({}).exec();
        await rabbit.closeConnection();
    });

    describe('#POST /api/video/', function () {
        context('When request is valid', function () {

            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
            });

            it('Should return created video', function (done: MochaDone) {
                request(server.app)
                    .post('/api/video/')
                    .send({ ...video })
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('id');
                        for (const prop in video) {
                            expect(res.body).to.have.property(prop, video[prop as keyof (typeof video)]);
                        }

                        done();
                    });
            });
        });

        context('When request is invalid', function () {

            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
            });

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .post('/api/video/')
                    .send({ ...invalidVideo })
                    .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', VideoValidationFailedError.name);
                        expect(res.body).to.have.property('message').which.contains(new VideoValidationFailedError().message);

                        done();
                    });
            });
        });
    });

    describe('#PUT /api/video/:id', function () {
        let returnedVideo: any;

        context('When request is valid', function () {

            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
                returnedVideo = await VideoManager.create(video);
            });

            it('Should return updated video', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/${returnedVideo.id}`)
                    .send({ ...updateVideo })
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        for (const prop in updateVideo) {
                            expect(res.body).to.have.property(prop, updateVideo[prop as keyof (typeof updateVideo)]);
                        }

                        done();
                    });
            });

            it('Should return error status when id is not found', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/${new mongoose.Types.ObjectId()}`)
                    .send({ video })
                    .set({ authorization: authorizationHeader })
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', VideoNotFoundError.name);
                        expect(res.body).to.have.property('message', new VideoNotFoundError().message);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
                returnedVideo = await VideoManager.create(video);
            });

            it('Should return error status when id is invalid', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/2`)
                    .send({ video })
                    .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', IdInvalidError.name);
                        expect(res.body).to.have.property('message', new IdInvalidError().message);

                        done();
                    });
            });

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/${returnedVideo.id}`)
                    .send({ ...invalidVideo })
                    .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', VideoValidationFailedError.name);
                        expect(res.body).to.have.property('message').which.contains(new VideoValidationFailedError().message);

                        done();
                    });
            });
        });
    });

    describe('#DELETE /api/video/:id', function () {
        let returnedVideo: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
                returnedVideo = await VideoManager.create(video);
            });

            it('Should return deleted video', function (done: MochaDone) {
                request(server.app)
                    .delete(`/api/video/${returnedVideo.id}`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');

                        for (const prop in video) {
                            expect(res.body).to.have.property(prop, video[prop as keyof (typeof video)]);
                        }

                        done();
                    });
            });

            it('Should return error status when id not found', function (done: MochaDone) {
                request(server.app)
                    .delete(`/api/video/${new mongoose.Types.ObjectId()}`)
                    .set({ authorization: authorizationHeader })
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', VideoNotFoundError.name);
                        expect(res.body).to.have.property('message', new VideoNotFoundError().message);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
                returnedVideo = await VideoManager.create(video);
            });

            it('Should return error status when id is invalid', function (done: MochaDone) {
                request(server.app)
                    .delete(`/api/video/${invalidId}`)
                    .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', IdInvalidError.name);
                        expect(res.body).to.have.property('message', new IdInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/video/amount', function () {

        context('When request is valid', function () {
            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
                await VideoManager.createMany(videos);
            });

            it('Should return amount of videos', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/amount?owner=${video3.owner}`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.equal(2);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/video/search', function () {

        context('When request is valid', function () {
            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
                await VideoManager.createMany(publicVideos);
            });

            it('Should return all videos when searchFilter is empty', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/search?searchFilter=`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        const returnedVideos: IVideo[] = res.body;
                        expect(returnedVideos.length).to.be.equals(publicVideos.length);

                        returnedVideos.forEach(function (vid) {
                            for (const prop in video) {
                                expect(vid).to.have.property(prop);
                            }
                        });

                        done();
                    });
            });

            it('Should return videos filitered by title / tag / desctiption', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/search?searchFilter=i`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');

                        const returnedVideos: IVideo[] = res.body;
                        const expectedResults = publicVideos.filter((video: IVideo) => {
                            return (
                                video.title.includes('i') ||
                                video.description.includes('i') ||
                                video.tags!.some(t => t.includes('i'))
                            );
                        }).length;

                        expect(returnedVideos).to.have.length(expectedResults);

                        returnedVideos.forEach(function (vid) {
                            for (const prop in video) {
                                expect(vid).to.have.property(prop);
                            }
                        });

                        done();
                    });
            });
        });
    });

    describe('#GET /api/video/:id', function () {
        let returnedVideo: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await VideoModel.deleteMany({}).exec();
                returnedVideo = await VideoManager.create(video);
            });

            it('Should return video', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/${returnedVideo.id}`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');

                        for (const prop in video) {
                            expect(res.body).to.have.property(prop, video[prop as keyof IVideo]);
                        }

                        done();
                    });
            });

            it('Should return error when video not found', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/${new mongoose.Types.ObjectId()}`)
                    .set({ authorization: authorizationHeader })
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(res).to.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', VideoNotFoundError.name);
                        expect(res.body).to.have.property('message', new VideoNotFoundError().message);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await ClassificationSourceModel.create({ _id: 500, name: 'a', classificationId: 1, layer: 4 } as IClassificationSource);
                returnedVideo = await VideoManager.create({ ...video, classificationSource: 500 });
            });

            afterEach(async function () {
                await VideoModel.deleteMany({}).exec();
                await ClassificationSourceModel.deleteMany({}).exec();
            });

            it('Should return error status when id is invalid', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/${invalidId}`)
                    .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', IdInvalidError.name);
                        expect(res.body).to.have.property('message', new IdInvalidError().message);

                        done();
                    });
            });

            it('Should return 403 error code when user is not permitted to watch video', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/${returnedVideo.id}`)
                    .set({ authorization: authorizationHeader })
                    .expect(403)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(403);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', UnauthorizedError.name);
                        expect(res.body).to.have.property('message', new UnauthorizedError().message);

                        done();
                    });
            });
        });
    });
});
