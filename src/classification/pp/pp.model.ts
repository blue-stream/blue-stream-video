import * as mongoose from 'mongoose';
import { IPp } from './pp.interface';

const ppSchema: mongoose.Schema = new mongoose.Schema(
    {
        _id: {
            type: Number,
            unique: true,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
        },
    },
    {
        autoIndex: false,
        timestamps: true,
    },
);

export const PpModel =
    mongoose.model<IPp & mongoose.Document>(
        'Pp',
        ppSchema,
    );
