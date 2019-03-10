import { ClassificationLastUpdateModel } from './classification-last-update.model';
import { config } from '../../config';

export async function shouldUpdateUserClassifications(user: string): Promise<boolean> {
    const userLastUpdate = await ClassificationLastUpdateModel.findOne({ user }).exec();

    if (!userLastUpdate) {
        await ClassificationLastUpdateModel.create({ user });

        return true;
    }

    const now = Date.now();
    const timeDiff = Math.abs(userLastUpdate.date.getTime() - now);
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const shouldUpdate = daysDiff > config.classifications.expirationDays;

    if (shouldUpdate) {
        await ClassificationLastUpdateModel.findOneAndUpdate(
            { user },
            {}, // Update only date (happens automatically)
            { runValidators: true },
        );
    }

    return shouldUpdate;
}
