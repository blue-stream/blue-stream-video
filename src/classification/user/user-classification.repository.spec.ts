import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../../config';
import { IUserClassification } from './user-classification.interface';
import { UserClassificationModel } from './user-classification.model';
import { UserClassificationRepository } from './user-classification.repository';

const classificationsMock: IUserClassification[] = [
    { classificationId: 1, user: 'a@a', layer: 2 },
    { classificationId: 1, user: 'b@b', layer: 3 },
    { classificationId: 2, user: 'a@a', layer: 4 },
    { classificationId: 2, user: 'c@c', layer: 1 },
    { classificationId: 3, user: 'a@a', layer: 0 },
    { classificationId: 3, user: 'b@b', layer: 2 },
    { classificationId: 3, user: 'c@c', layer: 2 },
];

describe('Classification Repository', function () {
    before(async function () {
        mongoose.set('useCreateIndex', true);
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await UserClassificationModel.deleteMany({}).exec();
    });

    after(async function () {
        await mongoose.connection.close();
    });

    describe('#createClassifications()', function () {
        context('When data is valid', function () {
            it('Should create a single classification', async function () {
                const classifications = await UserClassificationRepository.createClassifications([{
                    classificationId: 1,
                    user: 'a@a',
                    layer: 4,
                }]);

                expect(classifications).to.exist;
                expect(classifications).to.be.an('array');
                expect(classifications).to.have.lengthOf(1);

                const [classification] = classifications;

                expect(classification).to.exist;
                expect(classification).to.have.property('classificationId', 1);
                expect(classification).to.have.property('user', 'a@a');
                expect(classification).to.have.property('layer', 4);
                expect(classification).to.have.property('modificationDate').which.is.lessThan(new Date());
            });

            it('Should create multiple classifications', async function () {
                const classifications = await UserClassificationRepository.createClassifications([
                    { classificationId: 1, user: 'a@a', layer: 3 },
                    { classificationId: 2, user: 'a@a', layer: 3 },
                    { classificationId: 1, user: 'b@b', layer: 3 },
                ]);

                expect(classifications).to.exist;
                expect(classifications).to.be.an('array');
                expect(classifications).to.have.lengthOf(3);
            });

            it('Should do nothing when no classifications provided', async function () {
                const classifications = await UserClassificationRepository.createClassifications([]);

                expect(classifications).to.exist;
                expect(classifications).to.be.an('array');
                expect(classifications).to.have.lengthOf(0);
            });
        });

        context('When data is invalid', function () {
            it('Should not create classification with duplicate id and user', async function () {
                let hasThrown = false;

                try {
                    await UserClassificationRepository.createClassifications([
                        { classificationId: 1, user: 'a@a', layer: 3 },
                        { classificationId: 1, user: 'a@a', layer: 4 },
                    ]);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('code', 11000);
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should not create classification without user', async function () {
                let hasThrown = false;

                try {
                    await UserClassificationRepository.createClassifications([
                        { id: 1, layer: 3 } as any,
                    ]);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should not create classification without id', async function () {
                let hasThrown = false;

                try {
                    await UserClassificationRepository.createClassifications([
                        { user: 'a@a', layer: 3 } as any,
                    ]);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should not create classification with layer not in range of 0-4', async function () {
                let hasThrown = false;

                try {
                    await UserClassificationRepository.createClassifications([
                        { id: 1, user: 'a@a', layer: 7 } as any,
                    ]);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#removeUserClassifications()', function () {
        beforeEach(async function () {
            await UserClassificationRepository.createClassifications(classificationsMock);
        });

        context('When data is valid', function () {
            it('Should remove all user\'s classification', async function () {
                let classifications = await UserClassificationRepository.getUserClassifications('b@b');
                expect(classifications).to.exist;
                expect(classifications).to.be.an('array');
                expect(classifications).to.have.lengthOf(classificationsMock.filter(c => c.user === 'b@b').length);

                await UserClassificationRepository.removeUserClassifications('b@b');

                classifications = await UserClassificationRepository.getUserClassifications('b@b');

                expect(classifications).to.exist;
                expect(classifications).to.be.an('array');
                expect(classifications).to.have.lengthOf(0);
            });
        });
    });

    describe('#getUserClassifications()', function () {
        it('Should return empty array when user don\'t have any classifications', async function () {
            const classifications = await UserClassificationRepository.getUserClassifications('test@user');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');
            expect(classifications).to.have.lengthOf(0);
        });

        it('Should return user\'s classification', async function () {
            await UserClassificationRepository.createClassifications(classificationsMock);

            const classifications = await UserClassificationRepository.getUserClassifications('a@a');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');
            expect(classifications).to.have.lengthOf(classificationsMock.filter(c => c.user === 'a@a').length);
        });
    });
});