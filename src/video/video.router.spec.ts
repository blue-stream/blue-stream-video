import * as request from 'supertest';
import { expect } from 'chai';
import * as mongoose from 'mongoose';

import { IVideo } from './video.interface';
import { Server } from '../server';
import { PropertyInvalidError, IdInvalidError, VideoNotFoundError } from '../utils/errors/userErrors';
import { config } from '../config';
import { VideoManager } from './video.manager';
import { sign } from 'jsonwebtoken';

describe('Video Module', function () {
    let server: Server;
    const validProppertyString: string = '12345';
    const video: IVideo = {
        property: validProppertyString,
    };
    const authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;
    const invalidId: string = '1';
    const invalidProppertyString: string = '123456789123456789';
    const invalidVideo: IVideo = {
        property: invalidProppertyString,
    };
    
    const video2: IVideo = {
        property: '45678',
    };
    const video3: IVideo = {
        property: '6789',
    };

    const unexistingVideo: IVideo = {
        property: 'a',
    };

    const videos: IVideo[] =
        [video, video2, video3, video3];

    const invalidVideos: IVideo[] =
        [video, invalidVideo, video3];

    before(async function () {
                await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
        server = Server.bootstrap();
    });

        after(async function () {
        await mongoose.connection.db.dropDatabase();
    });
    describe('#POST /api/video/', function () {
        context('When request is valid', function () {
                        beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });
            it('Should return created video', function (done: MochaDone) {
                request(server.app)
                    .post('/api/video/')
                    .send({ video })
                                        .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', validProppertyString);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
                        beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });
            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .post('/api/video/')
                    .send({ video: invalidVideo })
                                        .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });
        describe('#POST /api/video/many/', function () {
        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });

            it('Should return created video', function (done: MochaDone) {
                request(server.app)
                    .post('/api/video/many/')
                    .send({ videos })
                                        .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        expect(res.body[1]).to.have.property('property', videos[1].property);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .post('/api/video/many/')
                    .send({ videos: invalidVideos })
                                        .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#PUT /api/video/many', function () {
        let returnedVideos: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedVideos = await VideoManager.createMany(videos);
            });

            it('Should return updated video', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/many`)
                    .send({ video: video2, videoFilter: video })
                                        .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('ok', 1);
                        expect(res.body).to.have.property('nModified', 1);

                        done();
                    });
            });

            it('Should return 404 error status code', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/many`)
                    .send({ video, videoFilter: unexistingVideo })
                                        .set({ authorization: authorizationHeader })
                    .expect(404)
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
                await mongoose.connection.db.dropDatabase();
                returnedVideos = await VideoManager.createMany(videos);
            });

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/many`)
                    .send({ video: invalidVideo, videoFilter: video2 })
                                        .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#PUT /api/video/:id', function () {
        let returnedVideo: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedVideo = await VideoManager.create(video);
            });

            it('Should return updated video', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/video/${returnedVideo.id}`)
                    .send({ video })
                                        .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', video.property);

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
                await mongoose.connection.db.dropDatabase();
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
                    .send({ video: invalidVideo })
                                        .set({ authorization: authorizationHeader })
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#DELETE /api/video/:id', function () {
        let returnedVideo: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedVideo = await VideoManager.create(video);
            });

            it('Should return updated video', function (done: MochaDone) {
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
                        expect(res.body).to.have.property('property', video.property);

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
                await mongoose.connection.db.dropDatabase();
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

    describe('#GET /api/video/one', function () {
        let returnedVideos: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedVideos = await VideoManager.createMany(videos);
            });

            it('Should return video', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/one?property=${video3.property}`)
                                        .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', videos[2].property);

                        done();
                    });
            });

            it('Should return error when video not found', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/one?property=${unexistingVideo.property}`)
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
    });

    describe('#GET /api/video/many', function () {
        let returnedVideos: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedVideos = await VideoManager.createMany(videos);
            });

            it('Should return video', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/many?property=${video3.property}`)
                                        .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        expect(res.body[1]).to.have.property('property', videos[2].property);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/video/amount', function () {
        let returnedVideos: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedVideos = await VideoManager.createMany(videos);
            });

            it('Should return video', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/amount?property=${video3.property}`)
                                        .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).be.equal(2);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/video/:id', function () {
        let returnedVideo: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
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
                        expect(res.body).to.have.property('property', video.property);

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
                await mongoose.connection.db.dropDatabase();
                returnedVideo = await VideoManager.create(video);
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
        });
    });
    });
