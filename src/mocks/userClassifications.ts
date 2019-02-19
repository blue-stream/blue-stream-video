import { IUserClassification } from '../user-classification/user-classification.interface';
import { getRandomInt } from '../utils/random';

export function generateUserClassifications(amount: number) {
    const userClassifications: IUserClassification[] = [];
    while (userClassifications.length < amount) {
        const random = getRandomInt(0, Math.max(200, amount));

        if (!userClassifications.find(u => u.classificationId === random)) {
            userClassifications.push({
                classificationId: getRandomInt(0, 200),
                layer: getRandomInt(0, 4),
                user: 'test@user',
            } as IUserClassification);
        }
    }

    return userClassifications;
}
