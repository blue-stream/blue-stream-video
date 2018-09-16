import * as mongoose from 'mongoose';
import { IVideo } from './video.interface';
import { VideoValidatons } from './validator/video.validations';

const videoSchema: mongoose.Schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            validate: (value: string) => {
                return VideoValidatons.isTitleValid(value);
            },
        },
        description: String,
        views: Number,
        owner: {
            type: String,
            required: true,
            validate: {
                validator: (value: string) => {
                    return VideoValidatons.isOwnerValid(value);
                },
            },
        },
        contentUrl: {
            type: String,
            required: true,
            validate: {
                validator: (value: string) => {
                    return VideoValidatons.isUrlValid(value);
                },
            },
        },
        thumbnailUrl: {
            type: String,
            required: true,
            validate: {
                validator: (value: string) => {
                    return VideoValidatons.isUrlValid(value);
                },
            },
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
