import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../config';
import { IView } from './view.interface';
import { ViewModel } from './view.model';
import { ViewRepository } from './view.repository';

const ObjectId = mongoose.Types.ObjectId;

const view: IView = {
    lastViewDate: new Date(),
    video: ObjectId(),
    user: 'user@domain',
};

const views: Partial<IView>[] = [
    {
        video: ObjectId(),
        user: '1@1',
    },
    {
        video: ObjectId(),
        user: '2@2',
    },
    {
        video: ObjectId(),
        user: '1@1',
    },
    {
        video: ObjectId(),
        user: '2@2',
    },
];

describe('View Repository', function () {
    before(async function () {
        mongoose.set('useCreateIndex', true);
        await mongoose.connect(config.db.connectionString, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await ViewModel.deleteMany({}).exec();
    });

    after(async function () {
        await mongoose.connection.close();
    });

    describe('#create', function () {
        context('When data is valid', function () {
            it('Should create a view document', async function () {
                const doc = await ViewRepository.create(view.video, view.user);

                expect(doc).to.exist;
                expect(doc).to.have.property('user', view.user);
                expect(doc).to.have.property('lastViewDate').which.is.instanceOf(Date);
            });

            it('Should throw an error when duplicate data inserted', async function () {
                let hasThrown = false;
                await ViewRepository.create(view.video, view.user);

                try {
                    await ViewRepository.create(view.video, view.user);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('code', 11000);
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should create view for different user and videos', async function () {
                const doc1 = await ViewRepository.create(view.video, `${view.user}1`);
                const doc2 = await ViewRepository.create(view.video, `${view.user}2`);

                expect(doc1).to.exist;
                expect(doc2).to.exist;
                expect(doc1).to.have.property('user', `${view.user}1`);
                expect(doc2).to.have.property('user', `${view.user}2`);
                expect(doc1).to.have.property('video', view.video);
                expect(doc2).to.have.property('video', view.video);
            });
        });

        context('When data is invalid', function () {
            it('Should throw validation error when user is invalid', async function () {
                let hasThrown = false;

                try {
                    await ViewRepository.create(view.video, 'test');
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw validation error when user is null', async function () {
                let hasThrown = false;

                try {
                    await ViewRepository.create(view.video, null as any);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw validation error when video is null', async function () {
                let hasThrown = false;

                try {
                    await ViewRepository.create(null as any, view.user);
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

    describe('#getOne', function () {
        context('When data is valid', function () {
            let createdView: IView;
            before(async function () {
                createdView = await ViewRepository.create(view.video, view.user);
            });

            it('Should return view', async function () {
                const doc = await ViewRepository.getOne(view.video, view.user);

                expect(doc).to.exist;
                for (const prop in view) {
                    expect(doc).to.have.property(prop).which.is.deep.equal(createdView[prop as keyof IView]);
                }
            });

            it('Should return null when view not exists', async function () {
                const doc = await ViewRepository.getOne(new ObjectId(), '');
                expect(doc).to.be.null;
            });
        });
    });

    describe('#getMany', function () {
        context('When data is valid', function () {
            beforeEach(async function () {
                await Promise.all(views.map(view => ViewRepository.create(view.video!, view.user!)));
            });

            it('Should return all documents when filter is empty', async function () {
                const _views = await ViewRepository.getMany({});

                expect(_views).to.exist;
                expect(_views).to.be.an('array');
                expect(_views).to.have.lengthOf(views.length);
            });

            it('Should return only matching documents', async function () {
                const _views = await ViewRepository.getMany({ user: '1@1' });

                expect(_views).to.exist;
                expect(_views).to.be.an('array');
                expect(_views).to.have.lengthOf(views.filter(v => v.user === '1@1').length);
            });

            it('Should return empty array when no documents match filter criteria', async function () {
                const _views = await ViewRepository.getMany({ user: 'unexisting@view' });

                expect(_views).to.exist;
                expect(_views).to.be.an('array');
                expect(_views).to.have.lengthOf(0);
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when filter is not an object', async function () {
                let hasThrown = false;

                try {
                    await ViewRepository.getMany(0 as any);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ObjectParameterError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should return empty array when filter is not in the correct format', async function () {
                const docs = await ViewRepository.getMany({ hello: 'world' } as any);

                expect(docs).to.exist;
                expect(docs).to.be.an('array');
                expect(docs).to.have.lengthOf(0);
            });
        });
    });

    describe('#getAmount', function () {
        context('When data is valid', function () {
            beforeEach(async function () {
                await Promise.all(views.map(view => ViewRepository.create(view.video!, view.user!)));
            });

            it('Should return amount of all views when no filter provided', async function () {
                const amount = await ViewRepository.getAmount({});
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(views.length);
            });

            it('Should return amount of filtered views', async function () {
                const amount = await ViewRepository.getAmount({ user: '1@1' });
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.be.equal(views.filter(v => v.user === '1@1').length);
            });

            it('Should return 0 when no documents matching filter', async function () {
                const amount = await ViewRepository.getAmount({ user: 'a@b' } as any);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(0);
            });

            it('Should return amount of views filtered by multiple videos', async function () {
                const amount = await ViewRepository.getAmount({ user: { $in: ['1@1', '2@2'] } });
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.be.equal(views.filter(v => v.user === '1@1' || v.user === '2@2').length);
            });
        });

        context('When data is invalid', function () {
            it('Should return 0 when filter is not in the correct format', async function () {
                const amount = await ViewRepository.getAmount({ hello: 'world' } as any);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(0);
            });
        });
    });

    describe('#increaseView', function () {
        context('When data is valid', function () {
            it('Should create view when not exists', async function () {
                const _view = await ViewRepository.getOne(new ObjectId(), 'user@domain');
                expect(_view).to.not.exist;

                const createdView = await ViewRepository.increaseView(view.video, 'user@domain');
                expect(createdView).to.exist;
                expect(createdView).to.have.property('amount', 1);
                expect(createdView).to.have.property('user', 'user@domain');
                expect(createdView).to.have.property('video');
                expect(createdView.video.equals(view.video)).to.be.true;
            });

            it('Should increase view\'s amount when exists', async function () {
                const view = await ViewRepository.create(new ObjectId(), 'user@domain');
                expect(view).to.exist;
                expect(view).to.have.property('amount', 1);

                // Prevent "too fast" operation causing update time equal create time
                await timeout(20);

                const increasedView = await ViewRepository.increaseView(view.video, 'user@domain');
                expect(increasedView).to.have.property('amount', 2);
                expect(increasedView).to.have.property('lastViewDate').which.is.instanceOf(Date);
                expect(increasedView.lastViewDate.getTime()).to.be.greaterThan(view.lastViewDate.getTime());
            });
        });
    });
});

const timeout = (ms: number) => new Promise(res => setTimeout(res, ms));
