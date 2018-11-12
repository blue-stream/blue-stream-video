import { expect } from 'chai';
import { IdInvalidError, VideoValidationFailedError } from '../../utils/errors/userErrors';
import { responseMock, ValidRequestMocks } from './video.mocks';
import { VideoValidator } from './video.validator';
import { MockRequest } from 'node-mocks-http';
import { Request } from 'express';

describe('Video Validator Middleware', function () {
    const invalidProps = {
        title: 'a'.repeat(257),
        description: 'b'.repeat(5001),
        contentPath: 'invalid url',
        thumbnailPath: 'invalid url',
    };

    const nullProps = ['title', 'owner'];

    describe('Create Validator', function () {
        context('When valid arguments are passed', function () {
            it('Should not throw an error', function () {
                VideoValidator.canCreate(new ValidRequestMocks().create, responseMock, (error: Error) => {
                    expect(error).to.not.exist;
                });
            });
        });

        context('When invalid arguments are passed', function () {

            for (const prop in invalidProps) {
                it(`Should throw VideoValidationFailedError when ${prop} is invalid`, function () {
                    const invalidRequestMock = new ValidRequestMocks().create;
                    changeRequestProp(prop, invalidProps[prop as keyof (typeof invalidProps)], invalidRequestMock);

                    VideoValidator.canCreate(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(VideoValidationFailedError);
                        expect(error).to.have.property('message').which.contains(prop);
                    });
                });
            }

            it('Should throw VideoValidationFailedError when title is null', function () {
                const invalidRequestMock = new ValidRequestMocks().create;
                invalidRequestMock.body.title = null;

                VideoValidator.canCreate(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.instanceof(VideoValidationFailedError);
                });
            });

            it('Should throw VideoValidationFailedError when title is undefined', function () {
                const invalidRequestMock = new ValidRequestMocks().create;
                invalidRequestMock.body.title = undefined;

                VideoValidator.canCreate(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.instanceof(VideoValidationFailedError);
                });
            });
        });
    });

    describe('UpdateById Validator', function () {
        context('When valid arguments are passed', function () {
            it('Should not throw an error', function () {
                VideoValidator.canUpdateById(new ValidRequestMocks().updateById, responseMock, (error: Error) => {
                    expect(error).to.not.exist;
                });
            });
        });

        context('When invalid arguments are passed', function () {

            for (const prop in invalidProps) {
                it(`Should throw VideoValidationFailedError when ${prop} is invalid`, function () {
                    const invalidRequestMock = new ValidRequestMocks().updateById;
                    changeRequestProp(prop, invalidProps[prop as keyof (typeof invalidProps)], invalidRequestMock);

                    VideoValidator.canUpdateById(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(VideoValidationFailedError);
                        expect(error).to.have.property('message').which.contains(prop);
                    });
                });
            }

            it('Should throw an IdInvalidError When id is undefined', function () {
                const invalidRequestMock = new ValidRequestMocks().updateById;
                invalidRequestMock.params.id = undefined;

                VideoValidator.canUpdateById(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(IdInvalidError);
                });
            });

            it('Should throw an IdInvalidError When id is null', function () {
                const invalidRequestMock = new ValidRequestMocks().updateById;
                invalidRequestMock.params.id = null;

                VideoValidator.canUpdateById(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(IdInvalidError);
                });
            });

            it('Should throw an IdInvalidError When id is not a valid ObjectID', function () {
                const invalidRequestMock = new ValidRequestMocks().updateById;
                invalidRequestMock.params.id = '1244';

                VideoValidator.canUpdateById(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(IdInvalidError);
                });
            });
        });

        describe('canDeleteById Validator', function () {
            context('When valid arguments are passed', function () {
                it('Should not throw an error', function () {
                    VideoValidator.canDeleteById(new ValidRequestMocks().deleteById, responseMock, (error: Error) => {
                        expect(error).to.not.exist;
                    });
                });
            });

            context('When invalid arguments are passed', function () {
                it('Should throw an IdInvalidError When id is undefined', function () {
                    const invalidRequestMock = new ValidRequestMocks().deleteById;
                    invalidRequestMock.params.id = undefined;

                    VideoValidator.canDeleteById(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(IdInvalidError);
                    });
                });

                it('Should throw an IdInvalidError When id is null', function () {
                    const invalidRequestMock = new ValidRequestMocks().deleteById;
                    invalidRequestMock.params.id = undefined;

                    VideoValidator.canDeleteById(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(IdInvalidError);
                    });
                });

                it('Should throw an IdInvalidError When id is not a valid ObjectID', function () {
                    const invalidRequestMock = new ValidRequestMocks().deleteById;
                    invalidRequestMock.params.id = '1243';

                    VideoValidator.canDeleteById(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(IdInvalidError);
                    });
                });
            });
        });

        describe('canGetById Validator', function () {
            context('When valid arguments are passed', function () {
                it('Should not throw an error', function () {
                    VideoValidator.canGetById(new ValidRequestMocks().getById, responseMock, (error: Error) => {
                        expect(error).to.not.exist;
                    });
                });
            });

            context('When invalid arguments are passed', function () {
                it('Should throw an IdInvalidError When id is undefined', function () {
                    const invalidRequestMock = new ValidRequestMocks().getById;
                    invalidRequestMock.params.id = undefined;

                    VideoValidator.canGetById(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(IdInvalidError);
                    });
                });

                it('Should throw an IdInvalidError When id is null', function () {
                    const invalidRequestMock = new ValidRequestMocks().getById;
                    invalidRequestMock.params.id = null;

                    VideoValidator.canGetById(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(IdInvalidError);
                    });
                });

                it('Should throw an IdInvalidError When id is not a valid ObjectID', function () {
                    const invalidRequestMock = new ValidRequestMocks().getById;
                    invalidRequestMock.params.id = '1234';

                    VideoValidator.canGetById(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(IdInvalidError);
                    });
                });
            });
        });

        describe('canGetOne Validator', function () {
            context('When valid arguments are passed', function () {
                it('Should not throw an error', function () {
                    VideoValidator.canGetOne(new ValidRequestMocks().getOne, responseMock, (error: Error) => {
                        expect(error).to.not.exist;
                    });
                });
            });
        });

        describe('canGetMany Validator', function () {
            context('When valid arguments are passed', function () {
                it('Should not throw an error', function () {
                    VideoValidator.canGetMany(new ValidRequestMocks().getMany, responseMock, (error: Error) => {
                        expect(error).to.not.exist;
                    });
                });
            });
        });

        describe('canGetAmount Validator', function () {
            context('When valid arguments are passed', function () {
                it('Should not throw an error', function () {
                    VideoValidator.canGetAmount(new ValidRequestMocks().getAmount, responseMock, (error: Error) => {
                        expect(error).to.not.exist;
                    });
                });
            });
        });
    });
});

function changeRequestProp(prop: string, value: any, request: MockRequest<Request>) {
    if (prop === 'owner') {
        request.user = request.user ? { ...request.user, id: value } : { id: value };
    } else {
        request.body[prop] = value;
    }
}
