import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../config';
import { ServerError } from '../utils/errors/applicationError';
import { IVideo, VideoStatus } from './video.interface';
import { VideoRepository } from './video.repository';
import { VideoModel } from './video.model';

const validId: string = new mongoose.Types.ObjectId().toHexString();
const invalidId: string = 'invalid id';
const invalidVideo: Partial<IVideo> = {
    title: 'a'.repeat(300),
    owner: 'owner',
    contentPath: '',
    thumbnailPath: '',
    previewPath: '',
    status: 'UNKNOWN-STATUS' as any,
};

const videoFilter: Partial<IVideo> = { owner: 'john@lenon' };
const videoDataToUpdate: Partial<IVideo> = {
    title: 'updated title',
    status: VideoStatus.READY,
    tags: ['hello', 'world'],
};
const unexistingVideo: Partial<IVideo> = { title: 'a' };
const unknownProperty: Object = { unknownProperty: true };
const video: IVideo = {
    previewPath: 'YkgkThdzX-8.gif',
    contentPath: 'YkgkThdzX-8.mp4',
    description: 'John Lennon',
    owner: 'john@lenon',
    title: 'Imagine - John Lennon',
    thumbnailPath: 'ACSszfE1bmbrfGYUWaNbkn1UWPiwKiQzOJ0it.png',
    tags: ['music', 'john-lenon'],
    channel: 'Music',
};

const video2: IVideo = {
    title: 'BOB DYLAN - Mr Tambourine Man',
    description: `Subterranean Homesick Blues: A Tribute to Bob Dylan's 'Bringing It All Back Home'`,
    owner: 'bob@dylan',
    contentPath: 'PYF8Y47qZQY.mp4',
    thumbnailPath: 'w8qfEEDmQ.jpeg',
    channel: 'Music',
};

const video3: IVideo = {
    title: 'OFFICIAL Somewhere over the Rainbow - Israel "IZ" Kamakawiwoʻole',
    description: `Israel "IZ" Kamakawiwoʻole's Platinum selling hit "Over the Rainbow" OFFICIAL video produced by Jon de Mello for The Mountain Apple Company • HAWAI`,
    owner: 'mountain@apple',
    contentPath: 'V1bFr2SWP1I.mp4',
    thumbnailPath: 'AN66SAxZyTsOYDydiDuDzlWvf4cXAxDCoFYij5nkNg.png',
    channel: 'Music',
};

const video4: IVideo = {
    previewPath: 'GsgrO4-9.gif',
    contentPath: 'GsgrO4-9.mp4',
    description: 'This is description',
    owner: 'aaa@bbb',
    title: 'Hi this is title',
    thumbnailPath: 'ACSszfE1KoE4fGYUWaNbkn1UWPiwKiQzOJ0it.png',
    tags: ['Imagine'],
    channel: 'Music',
};

const videoArr = [video, video, video, video2, video3];

Object.freeze(video);
Object.freeze(video2);
Object.freeze(video3);
Object.freeze(video4);
Object.freeze(videoArr);

describe('Video Repository', function () {

    before(async function () {
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await VideoModel.deleteMany({}).exec();
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
                expect(createdVideo).to.have.property('tags').to.be.an('array').with.lengthOf(2);

                for (const prop in video) {
                    expectToHaveEqualProperty(createdVideo, prop, video[prop as keyof IVideo]);
                }

                expect(createdVideo).to.have.property('id').which.satisfies((id: any) => {
                    return mongoose.Types.ObjectId.isValid(id);
                });
            });

            it('Should create a video without changing views count', async function () {
                const createdVideo = await VideoRepository.create({ ...video, views: 50 });
                expect(createdVideo).to.exist;
                expect(createdVideo).to.have.property('views', 0);
            });

            it('Should allow creating video without thumbnailPath / contentPath', async function () {
                const vid = { ...video };
                delete vid.contentPath;
                delete vid.thumbnailPath;

                const createdVideo = await VideoRepository.create(vid);

                expect(createdVideo).to.exist;
                expect(createdVideo).to.have.property('status', VideoStatus.PENDING);
                expect(createdVideo.contentPath).to.not.exist;
                expect(createdVideo.thumbnailPath).to.not.exist;
            });
        });

        context('When video is invalid', function () {

            ['contentPath', 'thumbnailPath'].forEach((prop) => {
                it(`Should throw error when status is READY and ${prop} is undefined`, async function () {
                    let hasThrown = false;

                    const vid = {
                        ...video,
                        [prop]: '',
                        status: VideoStatus.READY,
                    };

                    try {
                        await VideoRepository.create(vid);
                    } catch (err) {
                        hasThrown = true;
                        expect(err).to.exist;
                        expect(err).to.have.property('name', 'ValidationError');
                    } finally {
                        expect(hasThrown).to.be.true;
                    }
                });
            });

            it(`Should throw error when status is UPLOADED and 'originalPath' is undefined`, async function () {
                let hasThrown = false;

                const vid = {
                    ...video,
                    originalPath: undefined,
                    status: VideoStatus.UPLOADED,
                };

                try {
                    await VideoRepository.create(vid);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

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
                    expectToHaveEqualProperty(updatedDoc!, prop, videoDataToUpdate[prop as keyof IVideo]);
                }
            });

            it('Should not update an existing video when empty data provided', async function () {
                const updatedDoc = await VideoRepository.updateById(createdVideo.id!, {});
                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('id', createdVideo.id);

                for (const prop in video) {
                    expectToHaveEqualProperty(updatedDoc!, prop, createdVideo[prop as keyof IVideo]);
                }
            });

            it('Should return null when updated doc does not exists', async function () {
                const updatedDoc = await VideoRepository.updateById(new mongoose.Types.ObjectId().toHexString(), {});
                expect(updatedDoc).to.not.exist;
            });

            it('Should allow to update when status is not READY and contentPath / thumbnailPath are undefined', async function () {
                const updatedDoc = await VideoRepository.updateById(createdVideo.id!, {
                    status: VideoStatus.PENDING,
                });

                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('status', VideoStatus.PENDING);
            });

            it('Should allow update when status is UPLOAD and originalPath is valid', async function () {
                const updatedDoc = await VideoRepository.updateById(createdVideo.id!, {
                    status: VideoStatus.UPLOADED,
                    originalPath: 'valid-path.flv',
                });

                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('status', VideoStatus.UPLOADED);
                expect(updatedDoc).to.have.property('originalPath', 'valid-path.flv');
            });

            it('Should allow to update when status is given and contentPath / thumbnailPath are valid', async function () {
                const updatedDoc = await VideoRepository.updateById(createdVideo.id!, {
                    status: VideoStatus.READY,
                    thumbnailPath: 'valid-path.bmp',
                    contentPath: 'valid-path.mp4',
                });

                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('status', VideoStatus.READY);
                expect(updatedDoc).to.have.property('thumbnailPath', 'valid-path.bmp');
                expect(updatedDoc).to.have.property('contentPath', 'valid-path.mp4');
            });

            it('Should set `publishDate` when `published` field set to true first time', async function () {
                const updatedDoc = await VideoRepository.updateById(createdVideo.id!, {
                    published: true,
                });

                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('published', true);
                expect(updatedDoc).to.have.property('publishDate').which.is.instanceOf(Date);
            });

            it('Should not update `publishDate` on each update', async function () {
                const firstUpdate = await VideoRepository.updateById(createdVideo.id!, {
                    published: true,
                });

                const publishDate = firstUpdate!.publishDate;

                const secondUpdate = await VideoRepository.updateById(createdVideo.id!, {
                    title: 'Test',
                });

                expect(secondUpdate).to.exist;
                expect(secondUpdate).to.have.property('publishDate');
                expect(secondUpdate!.publishDate!.getTime()).to.equal(publishDate!.getTime());
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

            it('Should not allow to update status to UPLOADED when originalPath is undefined', async function () {
                let hasThrown = false;
                const vid = { ...video };
                delete vid.originalPath;

                const createdVid = await VideoRepository.create(vid);

                try {
                    await VideoRepository.updateById(createdVid.id!, { status: VideoStatus.UPLOADED });
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should not allow to update status to READY when contentPath / thumbnailPath are undefined', async function () {
                let hasThrown = false;
                const vid = { ...video };
                delete vid.contentPath;
                delete vid.thumbnailPath;

                const createdVid = await VideoRepository.create(vid);

                try {
                    await VideoRepository.updateById(createdVid.id!, { status: VideoStatus.READY });
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
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
                    expectToHaveEqualProperty(doc!, prop, video[prop as keyof IVideo]);
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
                    expectToHaveEqualProperty(doc!, prop, video[prop as keyof IVideo]);
                }
            });

            for (const prop in video) {
                it(`Should return document by ${prop}`, async function () {
                    const doc = await VideoRepository.getOne({ [prop]: video[prop as keyof IVideo] });
                    expect(doc).to.exist;
                    expect(doc).to.have.property('id', document.id);
                    for (const prop in video) {
                        expectToHaveEqualProperty(doc!, prop, video[prop as keyof IVideo]);
                        // expect(doc).to.have.property(prop, video[prop as keyof IVideo]);
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
                await VideoRepository.createMany(videoArr);
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

            it('Should return paged results', async function () {
                const videos: IVideo[] = [];
                for (let i = 0; i < config.pagination.resultsPerPage * 2; i++) {
                    videos.push({
                        channel: i.toString(),
                        title: `video number ${i}`,
                        owner: 'a@b',
                    } as IVideo);
                }

                await VideoRepository.createMany(videos);

                const result = await VideoRepository.getMany({});

                expect(result).to.exist;
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(config.pagination.resultsPerPage);
            });

            it('Should return sorted results', async function () {
                const videos: IVideo[] = [];
                for (let i = 0; i < config.pagination.resultsPerPage * 2; i++) {
                    videos.push({
                        channel: i.toString(),
                        title: `video number ${i}`,
                        owner: 'a@b',
                    } as IVideo);
                }

                const createdVids = await VideoRepository.createMany(videos);

                const promises = [];
                for (let i = 0; i < 45; i++) {
                    if (i % 5 === 0) {
                        promises.push(VideoRepository.increaseViews(createdVids[1].id!));
                    }
                    promises.push(VideoRepository.increaseViews(createdVids[2].id!));
                }

                await Promise.all(promises);
                const result = await VideoRepository.getMany({});

                expect(result).to.exist;
                expect(result).to.be.an('array');
                expect(result).to.have.lengthOf(config.pagination.resultsPerPage);
                expect(result[0]).to.have.property('views', 45);
                expect(result[1]).to.have.property('views', 9);
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
                await VideoRepository.createMany(videoArr);
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

    describe('#getSearched()', function () {
        const videosArr = [...videoArr, video4];

        context('When data is valid', function () {
            beforeEach(async function () {
                await VideoRepository.createMany(videosArr);
            });

            it('Should return all videos when searchFilter is empty', async function () {
                const documents = await VideoRepository.getSearched('');
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(videosArr.length);
            });

            it('Should return a video that contains \'OFFICIAL\' in title', async function () {
                const documents = await VideoRepository.getSearched('OFFICIAL');
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(videosArr.filter(v => v.title.includes('OFFICIAL')).length);
            });

            it('Should return a video that contains \'music\' in tag', async function () {
                const documents = await VideoRepository.getSearched('music');
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(1);
            });

            it('Should return a video that contains \'Back Home\' in description', async function () {
                const documents = await VideoRepository.getSearched('Back Home');
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(1);
            });

            it('Should return all videos that have \'I\' in title/tag/desctiption', async function () {
                const documents = await VideoRepository.getSearched('I');
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(videosArr.length);
            });

            it('Should return all videos that have \'Imagine\' in title/tag/desctiption', async function () {
                const documents = await VideoRepository.getSearched('Imagine');
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(3);
            });

            it('Should return an empty array when searchFilter is not present in any videos\' title/tag/desctiption', async function () {
                const documents = await VideoRepository.getSearched('aaaaaa');
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(0);
            });
        });
    });

    describe('#getSearchedAmount()', function () {
        const videosArr = [...videoArr, video4];

        context('When data is valid', function () {
            beforeEach(async function () {
                await VideoRepository.createMany(videosArr);
            });

            it('Should return all videos when searchFilter is empty', async function () {
                const documents = await VideoRepository.getSearchedAmount('');
                expect(documents).to.exist;
                expect(documents).to.be.a('number');
                expect(documents).to.be.equal(videosArr.length);
            });

            it('Should return a video that contains \'OFFICIAL\' in title', async function () {
                const documents = await VideoRepository.getSearchedAmount('OFFICIAL');
                expect(documents).to.exist;
                expect(documents).to.be.a('number');
                expect(documents).to.be.equal(1);
            });

            it('Should return a video that contains \'music\' in tag', async function () {
                const documents = await VideoRepository.getSearchedAmount('music');
                expect(documents).to.exist;
                expect(documents).to.be.a('number');
                expect(documents).to.be.equal(2);
            });

            it('Should return a video that contains \'Back Home\' in description', async function () {
                const documents = await VideoRepository.getSearchedAmount('Back Home');
                expect(documents).to.exist;
                expect(documents).to.be.a('number');
                expect(documents).to.be.equal(1);
            });

            it('Should return all videos that have \'I\' in title/tag/desctiption', async function () {
                const documents = await VideoRepository.getSearchedAmount('I');
                expect(documents).to.exist;
                expect(documents).to.be.a('number');
                expect(documents).to.be.equal(videosArr.length);
            });

            it('Should return all videos that have \'Imagine\' in title/tag/desctiption', async function () {
                const documents = await VideoRepository.getSearchedAmount('Imagine');
                expect(documents).to.exist;
                expect(documents).to.be.a('number');
                expect(documents).to.be.equal(3);
            });

            it('Should return an empty array when searchFilter is not present in any videos\' title/tag/desctiption', async function () {
                const documents = await VideoRepository.getSearchedAmount('aaaaaa');
                expect(documents).to.exist;
                expect(documents).to.be.a('number');
                expect(documents).to.be.equal(0);
            });
        });
    });

    describe('#increaseViews()', function () {
        context('When data is valid', function () {
            let createdVideo: IVideo;

            beforeEach(async function () {
                createdVideo = await VideoRepository.create(video);
                await VideoRepository.createMany(videoArr);
            });

            it('Should increase views by 1', async function () {
                expect(createdVideo).to.have.property('views', 0);

                const vid = await VideoRepository.increaseViews(createdVideo!.id!);

                expect(vid).to.exist;
                expect(vid).to.have.property('views', 1);
            });

            it('Should return null when video not exists', async function () {
                const vid = await VideoRepository.increaseViews(new mongoose.Types.ObjectId().toHexString());

                expect(vid).to.not.exist;
            });
        });

        context('When data is invalid', function () {
            it('Should throw an error when id is not a valid ObjectId', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.increaseViews('test');
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.be.instanceOf(mongoose.CastError);
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

});

function expectToHaveEqualProperty(source: Object, prop: string, value: any) {
    if (typeof value === 'object') {
        expect(source).to.have.property(prop).deep.equal(value);
    } else {
        expect(source).to.have.property(prop, value);
    }
}
