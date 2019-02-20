import { HttpClient } from '../../utils/http.client';
import { IUserClassification } from './user-classification.interface';

interface UserPermissions {
    classificationsAllow: {
        classificationId: number,
        classificationLayer: 0 | 1 | 2 | 3 | 4,
    }[];
}

export class UserClassificationService {
    static async fetchUserClassifications(userId: string): Promise<IUserClassification[] | undefined> {
        const result: UserPermissions = await HttpClient.get('/userPermissions', { userName: userId }).catch(() => undefined);
        return result ? result.classificationsAllow.map((classification) => {
            return {
                classificationId: classification.classificationId,
                layer: classification.classificationLayer,
                user: userId,
            };
        }) : undefined;
    }
}
