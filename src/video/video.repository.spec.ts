import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../config';
import { ServerError } from '../utils/errors/applicationError';
import { IVideo } from './video.interface';
import { VideoRepository } from './video.repository';

const validId: string = new mongoose.Types.ObjectId().toHexString();
const invalidId: string = 'invalid id';
const video: IVideo = {
    property: 'prop',
};
const videoArr: IVideo[] = ['prop', 'prop', 'prop', 'b', 'c', 'd'].map(item => ({ property: item }));
const invalidVideo: any = {
    property: { invalid: true },
};
const videoFilter: Partial<IVideo> = { property: 'prop' };
const videoDataToUpdate: Partial<IVideo> = { property: 'updated' };
const unexistingVideo: Partial<IVideo> = { property: 'unexisting' };
const unknownProperty: Object = { unknownProperty: true };

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
                expect(createdVideo).to.have.property('property', 'prop');
                expect(createdVideo).to.have.property('createdAt');
                expect(createdVideo).to.have.property('updatedAt');
                expect(createdVideo).to.have.property('_id').which.satisfies((id: any) => {
                    return mongoose.Types.ObjectId.isValid(id);
                });
            });
        });

        context('When video is invalid', function () {
            it('Should throw validation error when incorrect property type', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.create(invalidVideo);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/cast.+failed/i);
                    expect(err).to.have.property('errors');
                    expect(err.errors).to.have.property('property');
                    expect(err.errors.property).to.have.property('name', 'CastError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

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

    describe('#createMany()', function () {
        context('When data is valid', function () {
            it('Should create many documents', async function () {
                const createdDocuments = await VideoRepository.createMany(videoArr);

                expect(createdDocuments).to.exist;
                expect(createdDocuments).to.be.an('array');
                expect(createdDocuments).to.have.lengthOf(6);
            });

            it('Should not create documents when empty array passed', async function () {
                const docs = await VideoRepository.createMany([]);

                expect(docs).to.exist;
                expect(docs).to.be.an('array');
                expect(docs).to.be.empty;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when 1 of the docs invalid', async function () {
                let hasThrown = false;
                const docs: IVideo[] = [
                    ...videoArr,
                    {} as IVideo,
                ];

                try {
                    await VideoRepository.createMany(docs);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/path.+required/i);
                } finally {
                    expect(hasThrown).to.be.true;
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
            it('Should throw error when updated doc is not valid', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.updateById(createdVideo.id as string, { property: null } as any);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/path.+required/i);
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#updateMany()', function () {

        beforeEach(async function () {
            await VideoRepository.createMany(videoArr);
        });

        context('When data is valid', function () {

            it('Should update many documents', async function () {
                const updated = await VideoRepository.updateMany(videoFilter, videoDataToUpdate);

                const amountOfRequiredUpdates = videoArr.filter((item: IVideo) => {
                    let match = true;
                    for (const prop in videoFilter) {
                        match = match && item[prop as keyof IVideo] === videoFilter[prop as keyof IVideo];
                    }

                    return match;
                }).length;

                expect(updated).to.exist;
                expect(updated).to.have.property('nModified', amountOfRequiredUpdates);

                const documents = await VideoRepository.getMany(videoDataToUpdate);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(amountOfRequiredUpdates);
            });

            it('Should update all documents when no filter passed', async function () {
                const updated = await VideoRepository.updateMany({}, videoDataToUpdate);
                expect(updated).to.exist;
                expect(updated).to.have.property('nModified', videoArr.length);

                const documents = await VideoRepository.getMany(videoDataToUpdate);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(videoArr.length);
            });

            it('Should do nothing when criteria does not match any document', async function () {
                const updated = await VideoRepository.updateMany(unexistingVideo, videoDataToUpdate);
                expect(updated).to.exist;
                expect(updated).to.have.property('nModified', 0);

                const documents = await VideoRepository.getMany(videoDataToUpdate);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(0);
            });

        });

        context('When data is invalid', function () {

            it('Should throw error when empty data provided', async function () {
                let hasThrown = false;

                try {
                    await VideoRepository.updateMany(videoFilter, {});
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err instanceof ServerError).to.be.true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should not update documents when invalid data passed', async function () {
                await VideoRepository.updateMany({}, unknownProperty);

                const documents = await VideoRepository.getMany({});
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.satisfy((documents: IVideo[]) => {
                    documents.forEach((doc: IVideo) => {
                        for (const prop in unknownProperty) {
                            expect(doc).to.not.have.property(prop);
                        }
                    });

                    return true;
                });
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

            it('Should return document by property', async function () {
                const doc = await VideoRepository.getOne(videoFilter);
                expect(doc).to.exist;
                expect(doc).to.have.property('id', document.id);
                for (const prop in video) {
                    expect(doc).to.have.property(prop, video[prop as keyof IVideo]);
                }
            });

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

            it('Should return only matching documents', async function () {
                const documents = await VideoRepository.getMany(videoFilter);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');

                const amountOfRequiredDocuments = videoArr.filter((item: IVideo) => {
                    let match = true;
                    for (const prop in videoFilter) {
                        match = match && item[prop as keyof IVideo] === videoFilter[prop as keyof IVideo];
                    }

                    return match;
                }).length;

                expect(documents).to.have.lengthOf(amountOfRequiredDocuments);
            });

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
                await VideoRepository.createMany(videoArr);
            });

            it('Should return amount of all documents when no filter provided', async function () {
                const amount = await VideoRepository.getAmount({});
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(videoArr.length);
            });

            it('Should return amount of filtered documents', async function () {
                const amount = await VideoRepository.getAmount(videoFilter);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');

                const amountOfRequiredDocuments = videoArr.filter((item: IVideo) => {
                    let match = true;
                    for (const prop in videoFilter) {
                        match = match && item[prop as keyof IVideo] === videoFilter[prop as keyof IVideo];
                    }

                    return match;
                }).length;

                expect(amount).to.equal(amountOfRequiredDocuments);
            });

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
