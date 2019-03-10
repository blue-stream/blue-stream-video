import { config } from '../config';
import { ClassificationHttpClient } from './classification-http.client';
import { IClassification } from './classification.interface';
import { IUserClassification } from './user-classification/user-classification.interface';
import { IUserPp } from './user-pp/user-pp.interface';

export class ClassificationService {
    static async fetchClassifications(userId: string): Promise<IClassification> {
        const result = await ClassificationHttpClient.get(
            config.classifications.service.userPermissionsEndpoint,
            { userName: userId },
        ).catch(() => undefined);

        let pps: IUserPp[] = [];
        let classifications: IUserClassification[] = [];

        if (result && result[config.classifications.properties.classificationsAllow]) {
            classifications = result[config.classifications.properties.classificationsAllow].map((classification: any) => ({
                classificationId: classification[config.classifications.properties.userClassificationId],
                layer: classification[config.classifications.properties.userClassificationLayer],
                user: userId,
            }));
        }

        if (result && result[config.classifications.properties.ppsAllow]) {
            pps = result[config.classifications.properties.ppsAllow].map((pp: any) => ({
                ppId: pp[config.classifications.properties.userPpsId],
                type: pp[config.classifications.properties.userPpsType],
                user: userId,
            }));
        }

        return { classifications, pps };
    }
}
