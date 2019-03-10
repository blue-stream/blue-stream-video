import * as mongoose from 'mongoose';
import { IClassificationLastUpdate } from './classification-last-update.interface';

const classificationLastUpdateSchema: mongoose.Schema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        versionKey: false,
        timestamps: {
            createdAt: false,
            updatedAt: 'date',
        },
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    },
);

export const ClassificationLastUpdateModel = mongoose.model<IClassificationLastUpdate & mongoose.Document>('ClassificationLastUpdate', classificationLastUpdateSchema);
