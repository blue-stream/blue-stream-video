import { IUserClassification } from '../classification/user-classification/user-classification.interface';

export class VideoAggregator {

    private static convertClassificationsToQuery(classifications: IUserClassification[]) {
        return classifications.map((classification: IUserClassification) => {
            return {
                'classification.classificationId': classification.classificationId,
                'classification.layer': { $lte: classification.layer },
            };
        });
    }

    private static preJoinMatcher(userClassifications: IUserClassification[]) {
        return (userClassifications && userClassifications.length > 0)
            ? []
            : [{ $match: { classificationSource: null } }];
    }

    private static postJoinMatcher(userClassifications: IUserClassification[]) {
        const classificationQuery = VideoAggregator.convertClassificationsToQuery(userClassifications);

        return (classificationQuery && classificationQuery.length > 0)
            ? [{
                $match: {
                    $or: [
                        { classificationSource: null },
                        ...classificationQuery,
                    ],
                },
            }]
            : [];
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

    static getClassificationsAggregator(userClassifications: IUserClassification[]) {
        return [
            ...VideoAggregator.preJoinMatcher(userClassifications),
            ...VideoAggregator.joinClassifications(),
            ...VideoAggregator.postJoinMatcher(userClassifications),
            { $addFields: { id: '$_id' } },
        ];
    }
}
