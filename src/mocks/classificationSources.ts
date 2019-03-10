import { IClassificationSource } from '../classification/source/classification-source.interface';
import { getClassifications } from './userClassifications';

export function getClassificationSources(): IClassificationSource[] {
    const maxLayers = 5;
    const classificationSources: IClassificationSource[] = [];
    const classifications = getClassifications();

    for (let i = 0; i < classifications.classifications.length * maxLayers; i++) {
        for (let j = 0; j < maxLayers; j++) {
            classificationSources.push({
                _id: (i * maxLayers + j) + 1,
                name: `source-${i}`,
                classificationId: i,
                layer: j,
            } as IClassificationSource);
        }
    }

    return classificationSources;
}
