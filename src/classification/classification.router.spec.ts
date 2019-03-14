import { expect } from 'chai';
import { sign } from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { config } from '../config';
import { Server } from '../server';
import { getPps } from '../mocks/pps';
import { getClassifications } from '../mocks/userClassifications';
import { getClassificationSources } from '../mocks/classificationSources';
import { ClassificationSourceModel } from './source/classification-source.model';
import { UserClassificationModel } from './user-classification/user-classification.model';
import { UserPpModel } from './user-pp/user-pp.model';
import { PpModel } from './pp/pp.model';

describe('Classification Router', function () {
    let server: Server;
    const authorizationHeader = `Bearer ${sign({ id: 'a@a' }, config.authentication.secret)}`;
    const unExistingUserauthorizationHeader = `Bearer ${sign({ id: 'unExisting@user' }, config.authentication.secret)}`;

    const classificationPps = getPps();
    const userClassifications = getClassifications();
    const classificationSources = getClassificationSources();

    before(async function () {
        await mongoose.connect(config.db.connectionString, { useNewUrlParser: true });
        await ClassificationSourceModel.insertMany(classificationSources);
        await UserClassificationModel.insertMany(userClassifications.classifications);
        await PpModel.insertMany(classificationPps);
        await UserPpModel.insertMany(userClassifications.pps);
        server = Server.bootstrap();
    });

    after(async function () {
        await ClassificationSourceModel.deleteMany({}).exec();
        await UserClassificationModel.deleteMany({}).exec();
        await PpModel.deleteMany({}).exec();
        await UserPpModel.deleteMany({}).exec();
        server.close();
    });

    describe('#GET /api/classification/sources', function () {
        context('When request is valid', function () {
            it('Should return arr with all user\'s sources when searchFilter is empty', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/classification/sources?searchFilter=`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        const returnedSources: { id: string, name: string }[] = res.body;

                        expect(returnedSources).to.not.be.empty;

                        returnedSources.forEach((source) => {
                            expect(source).to.have.property('id');
                            expect(source).to.have.property('name');
                        });

                        done();
                    });
            });

            it('Should return filtered arr with user\'s sources', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/classification/sources?searchFilter=2`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');

                        const returnedSources: { id: string, name: string }[] = res.body;

                        expect(returnedSources).to.not.be.empty;

                        returnedSources.forEach((source) => {
                            expect(source).to.have.property('id');
                            expect(source).to.have.property('name');
                        });

                        done();
                    });
            });

            it('Should return empty arr when user is not classified to any source', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/classification/sources?searchFilter=`)
                    .set({ authorization: unExistingUserauthorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        expect(res.body).to.have.lengthOf(0);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/classification/pps', function () {
        context('When request is valid', function () {
            it('Should return arr with all user\'s pps when searchFilter is empty', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/classification/pps?searchFilter=`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        const returnedPps: { id: string, name: string }[] = res.body;

                        expect(returnedPps).to.not.be.empty;

                        returnedPps.forEach((pp) => {
                            expect(pp).to.have.property('id');
                            expect(pp).to.have.property('name');
                        });

                        done();
                    });
            });

            it('Should return filtered arr with user\'s pps', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/classification/pps?searchFilter=1`)
                    .set({ authorization: authorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');

                        const returnedPps: { id: string, name: string }[] = res.body;

                        expect(returnedPps).to.not.be.empty;

                        returnedPps.forEach((pp) => {
                            expect(pp).to.have.property('id');
                            expect(pp).to.have.property('name');
                        });

                        done();
                    });
            });

            it('Should return empty arr when user is not classified to any pp', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/classification/pps?searchFilter=`)
                    .set({ authorization: unExistingUserauthorizationHeader })
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        expect(res.body).to.have.lengthOf(0);

                        done();
                    });
            });
        });
    });
});
