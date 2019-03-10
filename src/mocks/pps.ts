import { IPp } from '../classification/pp/pp.interface';

export function getPps(): IPp[] {
    return Array.from({ length: 100 }, (_, index: number) => {
        return {
            _id: index,
            name: index.toString(),
            type: 'a',
        } as IPp;
    });
}
