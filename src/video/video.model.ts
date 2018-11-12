import * as mongoose from 'mongoose';
import { VideoValidatons } from './validator/video.validations';
import { IVideo, VideoStatus } from './video.interface';

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
        contentPath: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return VideoValidatons.isUrlValid(value);
                },
            },
        },
        thumbnailPath: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return VideoValidatons.isUrlValid(value);
                },
            },
        },
        status: {
            type: String,
            enum: Object.keys(VideoStatus),
            default: VideoStatus.PENDING,
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

videoSchema.pre<IVideo & mongoose.Document>('save', function (next) {
    if (
        this.status &&
        this.status === VideoStatus.READY &&
        (!this.contentPath || !this.thumbnailPath)
    ) {
        const error = this.invalidate(
            'status',
            `Path 'status' cannot be 'READY' unless both 'contentPath' and 'thumbnailPath' are valid`,
            this.status,
        ) as mongoose.ValidationError;

        next(error);
    }

    next();
});

export const VideoModel = mongoose.model<IVideo & mongoose.Document>('Video', videoSchema);
