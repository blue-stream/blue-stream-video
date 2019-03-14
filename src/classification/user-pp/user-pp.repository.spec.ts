import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../../config';
import { IUserPp } from './user-pp.interface';
import { UserPpModel } from './user-pp.model';
import { UserPpRepository } from './user-pp.repository';
import { getPps } from '../../mocks/pps';
import { getClassifications } from '../../mocks/userClassifications';
import { PpModel } from '../pp/pp.model';

const ppsMock: IUserPp[] = [
    { ppId: 1, user: 'a@a', type: 'a' },
    { ppId: 2, user: 'b@b', type: 'b' },
    { ppId: 3, user: 'c@c', type: 'a' },
    { ppId: 4, user: 'a@a', type: 'a' },
];

const classificationPps = getPps();
const userClassifications = getClassifications().pps;

describe('Pp Repository', function () {
    before(async function () {
        mongoose.set('useCreateIndex', true);
        await mongoose.connect(config.db.connectionString, { useNewUrlParser: true });
        await PpModel.insertMany(classificationPps);
    });

    afterEach(async function () {
        await UserPpModel.deleteMany({}).exec();
    });

    after(async function () {
        await PpModel.deleteMany({}).exec();
        await mongoose.connection.close();
    });

    describe('#createPps()', function () {
        context('When data is valid', function () {
            it('Should create a single pp', async function () {
                const pps = await UserPpRepository.createPps([{
                    ppId: 1,
                    user: 'a@a',
                    type: 'a',
                }]);

                expect(pps).to.exist;
                expect(pps).to.be.an('array');
                expect(pps).to.have.lengthOf(1);

                const [pp] = pps;

                expect(pp).to.exist;
                expect(pp).to.have.property('ppId', 1);
                expect(pp).to.have.property('user', 'a@a');
                expect(pp).to.have.property('type', 'a');
            });

            it('Should create multiple pps', async function () {
                const pps = await UserPpRepository.createPps([
                    { ppId: 1, user: 'a@a', type: 'a' },
                    { ppId: 2, user: 'a@a', type: 'b' },
                    { ppId: 1, user: 'b@b', type: 'a' },
                ]);

                expect(pps).to.exist;
                expect(pps).to.be.an('array');
                expect(pps).to.have.lengthOf(3);
            });

            it('Should do nothing when no pps provided', async function () {
                const pps = await UserPpRepository.createPps([]);

                expect(pps).to.exist;
                expect(pps).to.be.an('array');
                expect(pps).to.have.lengthOf(0);
            });
        });

        context('When data is invalid', function () {
            it('Should not create classification with duplicate id and user', async function () {
                let hasThrown = false;

                try {
                    await UserPpRepository.createPps([
                        { ppId: 1, user: 'a@a', type: 'a' },
                        { ppId: 1, user: 'a@a', type: 'b' },
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
                    await UserPpRepository.createPps([
                        { ppId: 1, type: 'a' } as any,
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
                    await UserPpRepository.createPps([
                        { user: 'a@a', type: 'a' } as any,
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

    describe('#removeUserPps()', function () {
        beforeEach(async function () {
            await UserPpRepository.createPps(ppsMock);
        });

        context('When data is valid', function () {
            it('Should remove all user\'s classification', async function () {
                let pps = await UserPpRepository.getUserPps('b@b');
                expect(pps).to.exist;
                expect(pps).to.be.an('array');
                expect(pps).to.have.lengthOf(ppsMock.filter(p => p.user === 'b@b').length);

                await UserPpRepository.removeUserPps('b@b');

                pps = await UserPpRepository.getUserPps('b@b');

                expect(pps).to.exist;
                expect(pps).to.be.an('array');
                expect(pps).to.have.lengthOf(0);
            });
        });
    });

    describe('#getUserPps()', function () {
        it('Should return empty array when user don\'t have any classifications', async function () {
            const classifications = await UserPpRepository.getUserPps('test@user');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');
            expect(classifications).to.have.lengthOf(0);
        });

        it('Should return user\'s pps', async function () {
            await UserPpRepository.createPps(ppsMock);

            const pps = await UserPpRepository.getUserPps('a@a');

            expect(pps).to.exist;
            expect(pps).to.be.an('array');
            expect(pps).to.have.lengthOf(ppsMock.filter(p => p.user === 'a@a').length);
        });
    });

    describe('#getSearchedUserPps()', function () {
        beforeEach(async function () {
            await UserPpModel.insertMany(userClassifications);
        });

        it('Should return empty array when user is not classified to any pps', async function () {
            const classifications = await UserPpRepository.getSearchedUserPps('test@user');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');
            expect(classifications).to.have.lengthOf(0);
        });

        it('Should return empty array when filter doesn\'t match any pp', async function () {
            const classifications = await UserPpRepository.getSearchedUserPps('a@a', 'nonExists');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');
            expect(classifications).to.have.lengthOf(0);
        });

        it('Should return array with user\'s pps when user is classified to some filtered pps', async function () {
            const classifications = await UserPpRepository.getSearchedUserPps('a@a', '1');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');

            const permittedPps = classificationPps.filter((pp) => {
                return (!!userClassifications.find(c => c.ppId === pp._id && pp.name.includes('1')));
            });

            expect(classifications).to.have.lengthOf(permittedPps.length);

            classifications.forEach((pp) => {
                expect(pp).to.have.property('id');
                expect(pp).to.have.property('name');
            });
        });

        it('Should return array with all user\'s pps when filter is empty', async function () {
            const classifications = await UserPpRepository.getSearchedUserPps('a@a', '');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');

            const permittedPps = classificationPps.filter((pp) => {
                return (!!userClassifications.find(c => c.ppId === pp._id && pp.name.includes('')));
            });

            expect(classifications).to.have.lengthOf(permittedPps.length);

            classifications.forEach((pp) => {
                expect(pp).to.have.property('id');
                expect(pp).to.have.property('name');
            });
        });

        it('Should return array with all pps when isSysAdmin true without filter', async function () {
            const classifications = await UserPpRepository.getSearchedUserPps('a@a', '', true);

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');

            expect(classifications).to.have.lengthOf(classificationPps.length);

            classifications.forEach((source) => {
                expect(source).to.have.property('id');
                expect(source).to.have.property('name');
            });
        });
    });
});
