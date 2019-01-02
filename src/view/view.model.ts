import * as mongoose from 'mongoose';
import { IView } from './view.interface';
import { ViewValidations } from './validator/view.validations';

const viewSchema: mongoose.Schema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        user: {
            type: String,
            required: true,
            validate: {
                validator: ViewValidations.isUserValid,
            },
        },
        amount: {
            type: Number,
            default: 1,
        },
    },
    {
        versionKey: false,
        id: false,
        timestamps: {
            createdAt: false,
            updatedAt: 'lastViewDate',
        },
    },
);

viewSchema.index({ video: 1, user: 1 }, { unique: true });

export const ViewModel = mongoose.model<IView & mongoose.Document>('View', viewSchema);
