import { IClassificationSource } from '../classification/source/classification-source.interface';
import { getUserClassifications } from './userClassifications';

export function getClassificationSources(): IClassificationSource[] {
    const maxLayers = 5;
    const classificationSources: IClassificationSource[] = [];
    const userClassifications = getUserClassifications();

    for (let i = 0; i < userClassifications.length * maxLayers; i++) {
        for (let j = 0; j < maxLayers; j++) {
            classificationSources.push({
                _id: i * maxLayers + j,
                name: `source-${i}`,
                classificationId: i,
                layer: j,
            } as IClassificationSource);
        }
    }

    return classificationSources;
}
