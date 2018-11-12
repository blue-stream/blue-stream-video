import { expect } from 'chai';
import { sign } from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { config } from '../config';
import { Server } from '../server';
import { IdInvalidError, VideoNotFoundError, VideoValidationFailedError } from '../utils/errors/userErrors';
import { IVideo } from './video.interface';
import { VideoManager } from './video.manager';

describe('Video Module', function () {
    let server: Server;
    const validProppertyString: string = '12345';
    const video: IVideo = {
        contentPath: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
        description: 'John Lennon',
        owner: 'user@domain',
        title: 'Imagine - John Lennon',
        views: 157,
        thumbnailPath: 'https://yt3.ggpht.com/a-/ACSszfE1bmbrfGYUWaNbkn1UWPiwKiQzOJ0it_oupg=s288-mo-c-c0xffffffff-rj-k-no',
    };

    const authorizationHeader = `Bearer ${sign({ id: 'user@domain' }, config.authentication.secret)}`;
    const invalidId: string = '1';
    const invalidVideo: IVideo = {
        title: 'a'.repeat(300),
        owner: 'owner',
        contentPath: '',
        thumbnailPath: '',
        description: '',
        views: 2,
    };

    const video2: IVideo = {
        title: 'BOB DYLAN - Mr Tambourine Man',
        description: `Subterranean Homesick Blues: A Tribute to Bob Dylan's 'Bringing It All Back Home'`,
        owner: 'bob@dylan',
        views: 38169017,
        contentPath: 'https://www.youtube.com/watch?v=PYF8Y47qZQY',
        thumbnailPath: 'http://lh3.googleusercontent.com/w8qfEEDmQ-wPQBX5SVCne2ehV-oZrpIX6WdDTamHfh8ZRrl5Y3AsdkfHtatMnxLZVV1z7LmRdh9sDYHRtQQ=s176-c-k-c0x00ffffff-no-rj',
    };

    const video3: IVideo = {
        title: 'OFFICIAL Somewhere over the Rainbow - Israel "IZ" Kamakawiwoʻole',
        description: `Israel "IZ" Kamakawiwoʻole's Platinum selling hit "Over the Rainbow" OFFICIAL video produced by Jon de Mello for The Mountain Apple Company • HAWAI`,
        owner: 'mountain@apple',
        views: 579264778,
        contentPath: 'https://www.youtube.com/watch?v=V1bFr2SWP1I',
        thumbnailPath: 'https://yt3.ggpht.com/a-/AN66SAxZyTsOYDydiDuDzlWvf4cXAxDCoFYij5nkNg=s48-mo-c-c0xffffffff-rj-k-no',
    };

    const unexistingVideo: Partial<IVideo> = {
        title: 'a',
    };

    const updateVideo: Partial<IVideo> = {
        title: 'updated value',
    };

    const videos: IVideo[] =
        [video, video2, video3, video3];

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
                await mongoose.connection.db.dropDatabase();
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
                await mongoose.connection.db.dropDatabase();
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
                await mongoose.connection.db.dropDatabase();
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

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                await VideoManager.createMany(videos);
            });

            it('Should return video', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/one?title=${videos[0].title}`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');

                        for (const prop in video3) {
                            expect(res.body).to.have.property(prop, videos[0][prop as keyof IVideo]);
                        }

                        done();
                    });
            });

            it('Should return error when video not found', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/video/one?title=${unexistingVideo.title}`)
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

    describe('#GET /api/video/amount', function () {

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
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
