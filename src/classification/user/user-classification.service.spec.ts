import { expect } from 'chai';
import { UserClassificationsServiceMock } from './user-classification.service.mock';
import { UserClassificationService } from './user-classification.service';

describe('Classification Service', function () {

    before(function (done: MochaDone) {
        UserClassificationsServiceMock.startMock();
        done();
    });

    after(function (done: MochaDone) {
        UserClassificationsServiceMock.stopMock();
        done();
    });

    describe('#fetchUserClassifications()', function () {
        it('Should get user\'s classification from external api', async function () {
            const classifications = await UserClassificationService.fetchUserClassifications('c@moreThenLittle');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');
            expect(classifications).to.not.be.empty;
        });

        it('Should return empty array when user don\'t have any classifications', async function () {
            const classifications = await UserClassificationService.fetchUserClassifications('a@none');

            expect(classifications).to.exist;
            expect(classifications).to.be.an('array');
            expect(classifications).to.be.empty;
        });

        it('Should return null when user not exists in remote service', async function () {
            const classifications = await UserClassificationService.fetchUserClassifications('unknown@user');

            expect(classifications).to.not.exist;
        });
    });
});
