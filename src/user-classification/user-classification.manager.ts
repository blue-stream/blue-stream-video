import { config } from '../config';
import { IUserClassification } from './user-classification.interface';
import { UserClassificationRepository } from './user-classification.repository';
import { UserClassificationService } from './user-classification.service';

export class UserClassificationManager {
    static async getUserClassifications(userId: string): Promise<IUserClassification[]> {
        let classifications = await UserClassificationRepository.getUserClassifications(userId);
        if (!classifications || classifications.length === 0 || UserClassificationManager.hasExpiredClassification(classifications)) {
            classifications = await UserClassificationManager.updateUserClassifications(userId);
        }

        return classifications || [];
    }

    /**
     * Check whether user has expired classifications
     * @see config.classification.expirationDays
     * @param classifications Array of user's classifications
     */
    static hasExpiredClassification(classifications: IUserClassification[]): boolean {
        const now = Date.now();
        const expiredClassification = classifications.find((classification) => {
            const timeDiff = Math.abs(classification.modificationDate!.getTime() - now);
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            return daysDiff > config.classifications.expirationDays;
        });

        return !!expiredClassification;
    }

    /**
     * Update user's classification from the external service
     * (remove all previous classifications and use only new)
     * @param userId
     * @returns Updated classifications
     */
    static async updateUserClassifications(userId: string): Promise<IUserClassification[]> {
        let classifications = await UserClassificationService.fetchUserClassifications(userId);

        if (classifications) {
            await UserClassificationRepository.removeUserClassifications(userId);
            classifications = await UserClassificationRepository.createClassifications(classifications);
        }

        return classifications || [];
    }
}
