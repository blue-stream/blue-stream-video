import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../config';
import { ServerError } from '../utils/errors/applicationError';
import { IVideo } from './video.interface';
import { VideoRepository } from './video.repository';

const validId: string = new mongoose.Types.ObjectId().toHexString();
const invalidId: string = 'invalid id';
const invalidVideo: Partial<IVideo> = {
    title: 'a'.repeat(300),
    owner: 'owner',
    contentUrl: '',
    thumbnailUrl: '',
};

const videoFilter: Partial<IVideo> = { owner: 'john@lenon' };
const videoDataToUpdate: Partial<IVideo> = { title: 'updated title' };
const unexistingVideo: Partial<IVideo> = { title: 'a' };
const unknownProperty: Object = { unknownProperty: true };
const video: IVideo = {
    contentUrl: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
    description: 'John Lennon',
    owner: 'john@lenon',
    title: 'Imagine - John Lennon',
    views: 157,
    thumbnailUrl: 'https://yt3.ggpht.com/a-/ACSszfE1bmbrfGYUWaNbkn1UWPiwKiQzOJ0it_oupg=s288-mo-c-c0xffffffff-rj-k-no',
};

const video2: IVideo = {
    title: 'BOB DYLAN - Mr Tambourine Man',
    description: `Subterranean Homesick Blues: A Tribute to Bob Dylan's 'Bringing It All Back Home'`,
    owner: 'bob@dylan',
    views: 38169017,
    contentUrl: 'https://www.youtube.com/watch?v=PYF8Y47qZQY',
    thumbnailUrl: 'http://lh3.googleusercontent.com/w8qfEEDmQ-wPQBX5SVCne2ehV-oZrpIX6WdDTamHfh8ZRrl5Y3AsdkfHtatMnxLZVV1z7LmRdh9sDYHRtQQ=s176-c-k-c0x00ffffff-no-rj',
};

const video3: IVideo = {
    title: 'OFFICIAL Somewhere over the Rainbow - Israel "IZ" Kamakawiwoʻole',
    description: `Israel "IZ" Kamakawiwoʻole's Platinum selling hit "Over the Rainbow" OFFICIAL video produced by Jon de Mello for The Mountain Apple Company • HAWAI`,
    owner: 'mountain@apple',
    views: 579264778,
    contentUrl: 'https://www.youtube.com/watch?v=V1bFr2SWP1I',
    thumbnailUrl: 'https://yt3.ggpht.com/a-/AN66SAxZyTsOYDydiDuDzlWvf4cXAxDCoFYij5nkNg=s48-mo-c-c0xffffffff-rj-k-no',
};

const videoArr = [video, video, video, video2, video3];

Object.freeze(video);
Object.freeze(video2);
Object.freeze(video3);
Object.freeze(videoArr);

describe('Video Repository', function () {

    before(async function () {
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await mongoose.connection.dropDatabase();
    });

    after(async function () {
        await mongoose.connection.close();
    });

    describe('#create()', function () {
        context('When video is valid', function () {
            it('Should create video', async function () {
                const createdVideo = await VideoRepository.create(video);
                expect(createdVideo).to.exist;
                expect(createdVideo).to.have.property('createdAt');
                expect(createdVideo).to.have.property('updatedAt');

                for (const prop in video) {
                    expect(createdVideo).to.have.property(prop, video[prop as keyof IVideo]);
                }

                expect(createdVideo).to.have.property('id').which.satisfies((id: any) => {
                    return mongoose.Types.ObjectId.isValid(id);
                });
            });
        });

        context('When video is invalid', function () {
            for (const prop in invalidVideo) {
                it(`Should throw validation error when incorrect ${prop} entered`, async function () {
                    let hasThrown = false;

                    const vid = {
                        ...video,
                        [prop]: invalidVideo[prop as keyof IVideo],
                    };

                    try {
                        await VideoRepository.create(vid);
                    } catch (err) {
                        hasThrown = true;
                        expect(err).to.exist;
                        expect(err).to.have.property('name', 'ValidationError');
                        expect(err).to.have.property('errors');
                    } finally {
                        expect(hasThrown).to.be.true;
                    }
                });
            }

            it('Should throw validation error when empty video passed', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.create({} as IVideo);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/path.+required/i);
                } finally {
                    expect(hasThrown);
                }
            });
        });
    });

    describe('#updateById()', function () {

        let createdVideo: IVideo;

        beforeEach(async function () {
            createdVideo = await VideoRepository.create(video);
            expect(createdVideo).have.property('id');
        });

        context('When data is valid', function () {

            it('Should update an existsing video', async function () {
                const updatedDoc = await VideoRepository.updateById(createdVideo.id!, videoDataToUpdate);
                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('id', createdVideo.id);
                for (const prop in videoDataToUpdate) {
                    expect(updatedDoc).to.have.property(prop, videoDataToUpdate[prop as keyof IVideo]);
                }
            });

            it('Should not update an existing video when empty data provided', async function () {
                const updatedDoc = await VideoRepository.updateById(createdVideo.id!, {});
                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('id', createdVideo.id);

                for (const prop in video) {
                    expect(updatedDoc).to.have.property(prop, createdVideo[prop as keyof IVideo]);
                }
            });

            it('Should return null when updated doc does not exists', async function () {
                const updatedDoc = await VideoRepository.updateById(new mongoose.Types.ObjectId().toHexString(), {});
                expect(updatedDoc).to.not.exist;
            });
        });

        context('When data is not valid', function () {
            for (const prop in invalidVideo) {
                it(`Should throw error when ${prop} is invalid`, async function () {
                    let hasThrown = false;

                    try {
                        await VideoRepository.updateById(createdVideo.id as string, { [prop]: invalidVideo[prop as keyof IVideo] } as any);
                    } catch (err) {
                        hasThrown = true;
                        expect(err).to.exist;
                        expect(err).to.have.property('name', 'ValidationError');
                        expect(err).to.have.property('errors');
                        expect(err.errors).to.have.property(prop);
                    } finally {
                        expect(hasThrown).to.be.true;
                    }
                });
            }
        });
    });

    describe('#deleteById()', function () {

        let document: IVideo;

        beforeEach(async function () {
            document = await VideoRepository.create(video);
        });

        context('When data is valid', function () {

            it('Should delete document by id', async function () {
                const deleted = await VideoRepository.deleteById(document.id!);
                expect(deleted).to.exist;
                expect(deleted).to.have.property('id', document.id);

                const doc = await VideoRepository.getById(document.id!);
                expect(doc).to.not.exist;
            });

            it('Should return null when document not exists', async function () {
                const deleted = await VideoRepository.deleteById(new mongoose.Types.ObjectId().toHexString());
                expect(deleted).to.not.exist;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when id is not in the correct format', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.deleteById('invalid id');
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'CastError');
                    expect(err).to.have.property('kind', 'ObjectId');
                    expect(err).to.have.property('path', '_id');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#getById()', function () {

        context('When data is valid', function () {

            let document: IVideo;
            beforeEach(async function () {
                document = await VideoRepository.create(video);
            });

            it('Should return document by id', async function () {
                const doc = await VideoRepository.getById(document.id!);
                expect(doc).to.exist;
                expect(doc).to.have.property('id', document.id);
                for (const prop in video) {
                    expect(doc).to.have.property(prop, video[prop as keyof IVideo]);
                }
            });

            it('Should return null when document not exists', async function () {
                const doc = await VideoRepository.getById(validId);
                expect(doc).to.not.exist;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when id is not in correct format', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.getById(invalidId);
                } catch (err) {
                    hasThrown = true;

                    expect(err).to.exist;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#getOne()', function () {

        context('When data is valid', function () {
            let document: IVideo;

            beforeEach(async function () {
                document = await VideoRepository.create(video);
            });

            it('Should return document by id', async function () {
                const doc = await VideoRepository.getOne({ _id: document.id } as Partial<IVideo>);
                expect(doc).to.exist;
                for (const prop in video) {
                    expect(doc).to.have.property(prop, video[prop as keyof IVideo]);
                }
            });

            for (const prop in video) {
                it(`Should return document by ${prop}`, async function () {
                    const doc = await VideoRepository.getOne({ [prop]: video[prop as keyof IVideo] });
                    expect(doc).to.exist;
                    expect(doc).to.have.property('id', document.id);
                    for (const prop in video) {
                        expect(doc).to.have.property(prop, video[prop as keyof IVideo]);
                    }
                });
            }

            it('Should return null when document not exists', async function () {
                const doc = await VideoRepository.getOne(unexistingVideo);
                expect(doc).to.not.exist;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when filter not exists', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.getOne({});
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err instanceof ServerError).to.be.true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should return null when filter is not in the correct format', async function () {
                const doc = await VideoRepository.getOne(unknownProperty);
                expect(doc).to.not.exist;
            });
        });
    });

    describe('#getMany()', function () {

        context('When data is valid', function () {

            beforeEach(async function () {
                await Promise.all(videoArr.map(video => VideoRepository.create(video)));
            });

            it('Should return all documents when filter is empty', async function () {
                const documents = await VideoRepository.getMany({});
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(videoArr.length);
            });

            for (const prop in video) {
                it(`Should return only matching documents by ${prop}`, async function () {
                    const documents = await VideoRepository.getMany({ [prop]: video[prop as keyof IVideo] });
                    expect(documents).to.exist;
                    expect(documents).to.be.an('array');

                    const amountOfRequiredDocuments = videoArr.filter((item: IVideo) => {
                        return item[prop as keyof IVideo] === video[prop as keyof IVideo];
                    }).length;

                    expect(documents).to.have.lengthOf(amountOfRequiredDocuments);
                });
            }

            it('Should return empty array when critiria not matching any document', async function () {
                const documents = await VideoRepository.getMany(unexistingVideo);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(0);
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when filter is not an object', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.getMany(0 as any);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ObjectParameterError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should return null when filter is not in correct format', async function () {
                const documents = await VideoRepository.getMany(unknownProperty);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(0);
            });
        });
    });

    describe('#getAmount()', function () {

        context('When data is valid', function () {

            beforeEach(async function () {
                await Promise.all(videoArr.map(video => VideoRepository.create(video)));
            });

            it('Should return amount of all documents when no filter provided', async function () {
                const amount = await VideoRepository.getAmount({});
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(videoArr.length);
            });

            for (const prop in video) {
                it(`Should return amount of filtered documents by ${prop}`, async function () {
                    const amount = await VideoRepository.getAmount({ [prop]: video[prop as keyof IVideo] });
                    expect(amount).to.exist;
                    expect(amount).to.be.a('number');

                    const amountOfRequiredDocuments = videoArr.filter((item: IVideo) => {
                        return item[prop as keyof IVideo] === video[prop as keyof IVideo];
                    }).length;

                    expect(amount).to.equal(amountOfRequiredDocuments);
                });
            }

            it('Should return 0 when no documents matching filter', async function () {
                const amount = await VideoRepository.getAmount(unexistingVideo);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(0);
            });
        });

        context('When data is invalid', function () {
            it('Should return 0 when filter is not in the correct format', async function () {
                const amount = await VideoRepository.getAmount(unknownProperty);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(0);
            });
        });
    });

});
