import * as mongoose from 'mongoose';
import { IUserPp } from './user-pp.interface';

const userPpSchema: mongoose.Schema = new mongoose.Schema(
    {
        ppId: {
            type: Number,
            required: true,
        },
        user: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: false,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    },
);

userPpSchema.index({ ppId: 1, user: 1 }, { unique: true });

export const UserPpModel = mongoose.model<IUserPp & mongoose.Document>('UserPp', userPpSchema);
