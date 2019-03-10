import * as mongoose from 'mongoose';
import { IUserClassification } from './user-classification.interface';

const userClassificationSchema: mongoose.Schema = new mongoose.Schema(
    {
        classificationId: {
            type: Number,
            required: true,
        },
        user: {
            type: String,
            required: true,
        },
        layer: {
            type: Number,
            required: true,
            min: 0,
            max: 4,
        },
    },
    {
        versionKey: false,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    },
);

userClassificationSchema.index({ classificationId: 1, user: 1 }, { unique: true });

export const UserClassificationModel = mongoose.model<IUserClassification & mongoose.Document>('UserClassification', userClassificationSchema);
