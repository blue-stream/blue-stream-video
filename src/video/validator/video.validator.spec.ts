import { expect } from 'chai';
import { Types } from 'mongoose';
import { VideoValidator } from './video.validator';
import { ValidRequestMocks, responseMock } from './video.mocks';
import { PropertyInvalidError, IdInvalidError } from '../../utils/errors/userErrors';

describe('Video Validator Middleware', function () {
    describe('Create Validator', function () {
        context('When valid arguments are passed', function () {
            it('Should not throw an error', function () {
                VideoValidator.canCreate(new ValidRequestMocks().create, responseMock, (error: Error) => {
                    expect(error).to.not.exist;
                });
            });
        });

        context('When invalid arguments are passed', function () {
            it('Should throw an PropertyInvalidError When property is undefined', function () {
                const invalidRequestMock = new ValidRequestMocks().create;
                invalidRequestMock.body.video.property = undefined;

                VideoValidator.canCreate(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });

            it('Should throw an PropertyInvalidError When property is null', function () {
                const invalidRequestMock = new ValidRequestMocks().create;
                invalidRequestMock.body.video.property = null;

                VideoValidator.canCreate(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });

            it('Should throw an PropertyInvalidError When property is too long', function () {
                const invalidRequestMock = new ValidRequestMocks().create;
                invalidRequestMock.body.video.property = '122223344214142';

                VideoValidator.canCreate(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });
        });
    });

    describe('CreateMany Validator', function () {
        context('When valid arguments are passed', function () {
            it('Should not throw an error', function () {
                VideoValidator.canCreateMany(new ValidRequestMocks().createMany, responseMock, (error: Error) => {
                    expect(error).to.not.exist;
                });
            });
        });

        context('When invalid arguments are passed', function () {
            it('Should throw an PropertyInvalidError When property is undefined', function () {
                const invalidRequestMock = new ValidRequestMocks().createMany;
                invalidRequestMock.body.videos[1].property = undefined;

                VideoValidator.canCreateMany(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });

            it('Should throw an PropertyInvalidError When property is null', function () {
                const invalidRequestMock = new ValidRequestMocks().createMany;
                invalidRequestMock.body.videos[1].property = null;

                VideoValidator.canCreateMany(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });

            it('Should throw an PropertyInvalidError When property is too long', function () {
                const invalidRequestMock = new ValidRequestMocks().createMany;
                invalidRequestMock.body.videos[1].property = '21412412421412414214';

                VideoValidator.canCreateMany(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
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
            it('Should throw an PropertyInvalidError When property is undefined', function () {
                const invalidRequestMock = new ValidRequestMocks().updateById;
                invalidRequestMock.body.video.property = undefined;

                VideoValidator.canUpdateById(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });

            it('Should throw an PropertyInvalidError When property is null', function () {
                const invalidRequestMock = new ValidRequestMocks().updateById;
                invalidRequestMock.body.video.property = null;

                VideoValidator.canUpdateById(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });

            it('Should throw an PropertyInvalidError When property is too long', function () {
                const invalidRequestMock = new ValidRequestMocks().updateById;
                invalidRequestMock.body.video.property = '2142142142141241';

                VideoValidator.canUpdateById(invalidRequestMock, responseMock, (error: Error) => {
                    expect(error).to.exist;
                    expect(error).to.be.an.instanceof(PropertyInvalidError);
                });
            });

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

        describe('canUpdateMany Validator', function () {
            context('When valid arguments are passed', function () {
                it('Should not throw an error', function () {
                    VideoValidator.canUpdateMany(new ValidRequestMocks().updateMany, responseMock, (error: Error) => {
                        expect(error).to.not.exist;
                    });
                });
            });

            context('When invalid arguments are passed', function () {
                it('Should throw an PropertyInvalidError When property is undefined', function () {
                    const invalidRequestMock = new ValidRequestMocks().updateMany;
                    invalidRequestMock.body.video.property = undefined;

                    VideoValidator.canUpdateMany(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(PropertyInvalidError);
                    });
                });

                it('Should throw an PropertyInvalidError When property is null', function () {
                    const invalidRequestMock = new ValidRequestMocks().updateMany;
                    invalidRequestMock.body.video.property = null;

                    VideoValidator.canUpdateMany(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(PropertyInvalidError);
                    });
                });

                it('Should throw an PropertyInvalidError When property is too long', function () {
                    const invalidRequestMock = new ValidRequestMocks().updateMany;
                    invalidRequestMock.body.video.property = '21414141412414124';

                    VideoValidator.canUpdateMany(invalidRequestMock, responseMock, (error: Error) => {
                        expect(error).to.exist;
                        expect(error).to.be.an.instanceof(PropertyInvalidError);
                    });
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
