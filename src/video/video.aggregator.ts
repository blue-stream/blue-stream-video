import { IUserClassification } from '../classification/user-classification/user-classification.interface';
import { IClassification } from '../classification/classification.interface';
import { IUserPp } from '../classification/user-pp/user-pp.interface';

export class VideoAggregator {

    private static convertUserClassificationsToQuery(classifications: IUserClassification[]) {
        return classifications.map((classification: IUserClassification) => {
            return {
                'classification.classificationId': classification.classificationId,
                'classification.layer': { $lte: classification.layer },
            };
        });
    }

    private static convertUserPpsToQuery(pps: IUserPp[]) {
        const userPps: { pp: number | null }[] = pps.map((pp: IUserPp) => ({
            pp: pp.ppId,
        }));

        userPps.push({ pp: null });

        return userPps;
    }

    private static preJoinMatcher(classifications: IClassification, isSysAdmin: boolean = false) {
        if (
            isSysAdmin ||
            (
                classifications &&
                classifications.classifications &&
                classifications.classifications.length > 0
            )
        ) {
            return [];
        }

        return [{ $match: { classificationSource: null, pp: null } }];
    }

    private static postJoinMatcher(classifications: IClassification, isSysAdmin: boolean = false) {
        const classificationsQuery = VideoAggregator.convertUserClassificationsToQuery(classifications.classifications);
        const ppsQuery = VideoAggregator.convertUserPpsToQuery(classifications.pps);

        if (isSysAdmin || !classificationsQuery || classificationsQuery.length === 0) return [];

        return [{
            $match: {
                $or: [
                    { classificationSource: null, pp: null },
                    {
                        $and: [
                            { $or: [...ppsQuery] },
                            { $or: [...classificationsQuery] },
                        ],
                    },
                ],
            },
        }];
    }

    private static joinClassifications() {
        return [
            {
                $lookup: {
                    from: 'classificationsources',
                    localField: 'classificationSource',
                    foreignField: '_id',
                    as: 'classificationSourcesArr',
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { classification: { $arrayElemAt: ['$classificationSourcesArr', 0] } },
                            '$$ROOT',
                        ],
                    },
                },
            },
            {
                $project: {
                    classificationSourcesArr: 0,
                    'classification._id': 0,
                    'classification.__v': 0,
                    'classification.name': 0,
                    'classification.createdAt': 0,
                    'classification.updatedAt': 0,
                },
            },
        ];
    }

    static getClassificationsAggregator(classifications: IClassification, isSysAdmin: boolean = false) {
        return [
            ...VideoAggregator.preJoinMatcher(classifications, isSysAdmin),
            ...VideoAggregator.joinClassifications(),
            ...VideoAggregator.postJoinMatcher(classifications, isSysAdmin),
            { $addFields: { id: '$_id' } },
        ];
    }
}
