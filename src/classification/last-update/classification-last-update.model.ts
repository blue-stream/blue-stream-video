import * as mongoose from 'mongoose';
import { IClassificationLastUpdate } from './classification-last-update.interface';
import { config } from '../../config';

const classificationLastUpdateSchema: mongoose.Schema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: true,
            unique: true,
        }
    },
    {
        versionKey: false,
        timestamps: {
            createdAt: 'expireAt',
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

// If `config.classification.expirationDays` is changed, mongodb index need to be changed manully.
classificationLastUpdateSchema.index({ expireAt: 1 }, { expireAfterSeconds: config.classifications.expirationDays * 24 * 60 * 60 });

export const ClassificationLastUpdateModel = mongoose.model<IClassificationLastUpdate & mongoose.Document>('ClassificationLastUpdate', classificationLastUpdateSchema);
