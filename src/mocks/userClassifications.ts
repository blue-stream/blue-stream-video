import { IUserClassification } from '../classification/user/user-classification.interface';

export function getUserClassifications(): IUserClassification[] {
    return [
        { classificationId: 1, layer: 4, user: 'a@a' },
        { classificationId: 2, layer: 3, user: 'a@a' },
        { classificationId: 3, layer: 2, user: 'a@a' },
        { classificationId: 4, layer: 1, user: 'a@a' },
        { classificationId: 5, layer: 0, user: 'a@a' },
    ];
}
