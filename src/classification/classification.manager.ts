import { IClassification } from './classification.interface';
import { shouldUpdateUserClassifications } from './last-update/classification-last-update';
import { UserClassificationRepository } from './user-classification/user-classification.repository';
import { UserPpRepository } from './user-pp/user-pp.repository';
import { ClassificationService } from './classifications.service';
import { IUserPp } from './user-pp/user-pp.interface';
import { IUserClassification } from './user-classification/user-classification.interface';

export class ClassificationManager {
    static async getClassifications(userId: string): Promise<IClassification> {
        let classifications: IClassification;
        const shouldUpdate = await shouldUpdateUserClassifications(userId);

        if (shouldUpdate) {
            classifications = await ClassificationManager.updateClassifications(userId);
        } else {
            const userClassifications = await UserClassificationRepository.getUserClassifications(userId);
            const userPps = await UserPpRepository.getUserPps(userId);

            classifications = {
                classifications: userClassifications || [],
                pps: userPps || [],
            };
        }

        return classifications;
    }

    /**
     * Update user's classifications and pps from the external service
     * (remove all previous classifications and use only new)
     * @param userId
     * @returns Updated classifications
     */
    static async updateClassifications(userId: string): Promise<IClassification> {
        const fetchedClassifications = await ClassificationService.fetchClassifications(userId);

        let pps: IUserPp[] = [];
        let classifications: IUserClassification[] = [];

        if (fetchedClassifications && fetchedClassifications.classifications) {
            await UserClassificationRepository.removeUserClassifications(userId);
            classifications = await UserClassificationRepository.createClassifications(fetchedClassifications.classifications);
        }

        if (fetchedClassifications && fetchedClassifications.pps) {
            await UserPpRepository.removeUserPps(userId);
            pps = await UserPpRepository.createPps(fetchedClassifications.pps);
        }

        return {
            pps: pps || [],
            classifications: classifications || [],
        };
    }
}
