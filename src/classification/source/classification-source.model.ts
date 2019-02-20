import * as mongoose from 'mongoose';
import { IClassificationSource } from './classification-source.interface';

const classificationSourceSchema: mongoose.Schema = new mongoose.Schema(
    {
        _id: {
            type: Number,
            unique: true,
            required: true,
        },
        classificationId: {
            type: Number,
            required: true,
        },
        layer: {
            type: Number,
            required: true,
            min: 0,
            max: 4,
        },
        name: {
            type: String,
            required: true,
        },
    },
    {
        autoIndex: false,
        timestamps: true,
    },
);

export const ClassificationSourceModel =
    mongoose.model<IClassificationSource & mongoose.Document>(
        'ClassificationSource',
        classificationSourceSchema,
    );
