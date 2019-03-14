import { ClassificationSourceModel } from './classification-source.model';

export class ClassificationSourceRepository {
    static getSearchedUserSources(userId: string, searchFilter: string = '', isSysAdmin: boolean = false) {
        return ClassificationSourceModel.aggregate([
            { $match: { name: { $regex: searchFilter, $options: 'i' } } },
            ...(
                isSysAdmin
                    ? []
                    : [{
                        $lookup: {
                            from: 'userclassifications',
                            let: { cId: '$classificationId', usr: '$user', lyr: '$layer' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$user', userId] },
                                                { $eq: ['$$cId', '$classificationId'] },
                                                { $lte: ['$$lyr', '$layer'] },
                                            ],
                                        },
                                    },
                                },
                            ],
                            as: 'userClassifications',
                        },
                    },
                    { $unwind: '$userClassifications' },
                    { $match: { userClassifications: { $exists: true } } }]
            ),
            { $project: { id: '$_id', _id: 0, name: 1 } },
            { $sort: { name: 1 } },
        ]);
    }
}
