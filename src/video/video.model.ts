import * as mongoose from 'mongoose';
import { IVideo } from './video.interface';

const videoSchema: mongoose.Schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: String,
        views: Number,
        owner: {
            type: String,
            required: true,
        },
        contentUrl: {
            type: String,
            required: true,
        },
        thumbnailUrl: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: [

            ],
        },
    },
    {
        autoIndex: false,
        timestamps: true,
        id: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    });

export const VideoModel = mongoose.model<IVideo & mongoose.Document>('Video', videoSchema);
