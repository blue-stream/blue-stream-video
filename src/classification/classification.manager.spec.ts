import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../config';
import { ClassificationManager } from './classification.manager';
import { UserClassificationsServiceMock } from './classification.service.mock';
import { shouldUpdateUserClassifications } from './last-update/classification-last-update';
import { ClassificationLastUpdateModel } from './last-update/classification-last-update.model';
import { IUserClassification } from './user-classification/user-classification.interface';
import { UserClassificationModel } from './user-classification/user-classification.model';
import { UserClassificationRepository } from './user-classification/user-classification.repository';
import { IUserPp } from './user-pp/user-pp.interface';
import { UserPpModel } from './user-pp/user-pp.model';
import { UserPpRepository } from './user-pp/user-pp.repository';

const unknownUser = 'unknown@user';
const userWithNoClassifications = 'a@none';
const userWithClassifications = 'c@moreThenLittle';

describe('Classification Manager', function () {
    before(async function () {
        UserClassificationsServiceMock.startMock();
        mongoose.set('useCreateIndex', true);
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await UserClassificationModel.deleteMany({}).exec();
        await UserPpModel.deleteMany({}).exec();
        await ClassificationLastUpdateModel.deleteMany({}).exec();
    });

    after(async function () {
        UserClassificationsServiceMock.stopMock();
        await mongoose.connection.close();
    });

    describe('#updateClassifications()', function () {
        it('Should return empty classifications when user is unknown (in remote service)', async function () {
            const classifications = await ClassificationManager.updateClassifications(unknownUser);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.empty;
        });

        it('Should return empty classifications when user don\'t have any', async function () {
            const classifications = await ClassificationManager.updateClassifications(userWithNoClassifications);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.empty;
        });

        it('Should return user\'s classification and save it to db', async function () {
            const classifications = await ClassificationManager.updateClassifications(userWithClassifications);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.not.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.not.empty;

            const savedClassifications = await UserClassificationRepository.getUserClassifications(userWithClassifications);
            const savedPps = await UserPpRepository.getUserPps(userWithClassifications);

            expect(savedClassifications).to.exist;
            expect(savedClassifications).to.be.an('array');
            expect(savedClassifications).to.have.lengthOf(classifications.classifications.length);
            savedClassifications.forEach((classification) => {
                expect(classification).to.have.property('user', userWithClassifications);
            });

            expect(savedPps).to.exist;
            expect(savedPps).to.be.an('array');
            expect(savedPps).to.have.lengthOf(classifications.pps.length);
            savedPps.forEach((pp) => {
                expect(pp).to.have.property('user', userWithClassifications);
            });
        });

        it('Should override all user\'s classification from db with newly fetched classifications', async function () {
            // tslint:disable-next-line:prefer-array-literal
            const classifications: IUserClassification[] = (new Array(100).fill(0)).map((_, index: number) => {
                return { classificationId: index, user: userWithClassifications, layer: 2 as 0 | 1 | 2 | 3 | 4 };
            });

            const userClassifications = await UserClassificationRepository.createClassifications(classifications);
            expect(userClassifications).to.exist;
            expect(userClassifications).to.have.lengthOf(classifications.length);

            // tslint:disable-next-line:prefer-array-literal
            const pps: IUserPp[] = (new Array(100).fill(0)).map((_, index: number) => {
                return { ppId: index, user: userWithClassifications, type: 'a' };
            });

            const userPps = await UserPpRepository.createPps(pps);
            expect(userPps).to.exist;
            expect(userPps).to.have.lengthOf(pps.length);

            const updatedClassifications = await ClassificationManager.updateClassifications(userWithClassifications);
            expect(updatedClassifications).to.be.an('object');
            expect(updatedClassifications).to.have.property('classifications').which.has.length.lessThan(userClassifications.length);
            expect(updatedClassifications).to.have.property('pps').which.has.length.lessThan(userPps.length);
        });
    });

    describe('#getClassifications()', function () {
        it('Should return empty classifications when user don\'t have any', async function () {
            const classifications = await ClassificationManager.getClassifications(userWithNoClassifications);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.empty;
        });

        it('Should return empty array when user not exists in remote service', async function () {
            const classifications = await ClassificationManager.getClassifications(unknownUser);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.empty;
        });

        it('Should return user\'s classification and save it to db', async function () {
            const classifications = await ClassificationManager.getClassifications(userWithClassifications);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.not.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.not.empty;

            const savedClassifications = await UserClassificationRepository.getUserClassifications(userWithClassifications);
            expect(savedClassifications).to.exist;
            expect(savedClassifications).to.be.an('array');
            expect(savedClassifications).to.have.lengthOf(classifications.classifications.length);

            const savedPps = await UserPpRepository.getUserPps(userWithClassifications);
            expect(savedPps).to.exist;
            expect(savedPps).to.be.an('array');
            expect(savedPps).to.have.lengthOf(classifications.pps.length);
        });

        it('Should update user\'s classifications when there is an expired classification', async function () {
            const expiredClassifications: IUserClassification[] = [
                { classificationId: 1, user: userWithClassifications, layer: 1 },
                { classificationId: 2, user: userWithClassifications, layer: 1 },
                { classificationId: 3, user: userWithClassifications, layer: 1 },
            ];

            await UserClassificationRepository.createClassifications(expiredClassifications);
            await ClassificationLastUpdateModel.collection.insert({
                user: userWithClassifications,
                date: new Date(Date.now() + 24 * 60 * 60 * 1000 * (config.classifications.expirationDays + 1)),
            });

            const classifications = await ClassificationManager.getClassifications(userWithClassifications);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(await shouldUpdateUserClassifications(userWithClassifications)).to.be.false;
        });
    });
});
