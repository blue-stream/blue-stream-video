import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../../config';
import { ClassificationLastUpdateModel } from './classification-last-update.model';
import { shouldUpdateUserClassifications } from './classification-last-update';

describe('Classification Last Update', function () {
    before(async function () {
        mongoose.set('useCreateIndex', true);
        await mongoose.connect(config.db.connectionString, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await ClassificationLastUpdateModel.deleteMany({}).exec();
    });

    after(async function () {
        await mongoose.connection.close();
    });

    describe('#shouldUpdateUserClassifications()', function () {
        it('Should return true when created never checked before', async function () {
            const shouldUpdate = await shouldUpdateUserClassifications('test@test');

            expect(shouldUpdate).to.be.true;
        });

        it('Should return false when classification not expired yet', async function () {
            await shouldUpdateUserClassifications('test@test');
            const shouldUpdate = await shouldUpdateUserClassifications('test@test');

            expect(shouldUpdate).to.be.false;
        });
    });
});
