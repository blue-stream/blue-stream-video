import { ClassificationLastUpdateModel } from './classification-last-update.model';

export async function shouldUpdateUserClassifications(user: string): Promise<boolean> {
    const updateResult = await ClassificationLastUpdateModel.update(
        { user },
        { $set: { update: true } },
        { upsert: true, multi: false },
    );

    return !!updateResult.upserted;
}
