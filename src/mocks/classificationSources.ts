import { IClassificationSource } from '../source-classification/source-classification.interface';
import { getRandomInt } from '../utils/random';

export function generateClassificationSources(amount: number) {
    return Array.from({ length: amount }, (_, index: number) => {
        return {
            _id: index,
            classificationId: getRandomInt(0, 200),
            layer: getRandomInt(0, 4),
            name: `classification-source-${index}`,
        } as IClassificationSource;
    });
}
