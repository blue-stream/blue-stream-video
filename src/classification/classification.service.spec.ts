import { expect } from 'chai';
import { UserClassificationsServiceMock } from './classification.service.mock';
import { ClassificationService } from './classifications.service';

describe('Classification Service', function () {

    before(function (done: MochaDone) {
        UserClassificationsServiceMock.startMock();
        done();
    });

    after(function (done: MochaDone) {
        UserClassificationsServiceMock.stopMock();
        done();
    });

    describe('#fetchClassifications()', function () {
        it('Should get user\'s classification from external api', async function () {
            const classifications = await ClassificationService.fetchClassifications('c@moreThenLittle');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.not.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.not.empty;
        });

        it('Should return empty classifications when user don\'t have any classifications', async function () {
            const classifications = await ClassificationService.fetchClassifications('a@none');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.empty;
        });

        it('Should return null when user not exists in remote service', async function () {
            const classifications = await ClassificationService.fetchClassifications('unknown@user');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('object');
            expect(classifications).to.have.property('classifications').which.is.an('array').and.empty;
            expect(classifications).to.have.property('pps').which.is.an('array').and.empty;
        });
    });
});
