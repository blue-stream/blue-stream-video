import * as mongoose from 'mongoose';
import { VideoValidatons } from './validator/video.validations';
import { IVideo, VideoStatus } from './video.interface';
import { config } from '../config';

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
                    return VideoValidatons.isPathValid(value, ['mp4']);
                },
            },
        },
        thumbnailPath: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return VideoValidatons.isPathValid(value, config.allowedExtensions.images);
                },
            },
        },
        previewPath: {
            type: String,
            validate: {
                validator: (value: string) => {
                    return VideoValidatons.isPathValid(value, config.allowedExtensions.previews);
                },
            },
        },
        originalPath: {
            type: String, validate: {
                validator: (value: string) => {
                    return VideoValidatons.isPathValid(value, config.allowedExtensions.videos);
                },
            },
        },
        status: {
            type: String,
            enum: Object.keys(VideoStatus),
            default: VideoStatus.PENDING,
        },
        tags: [{
            type: String,
        }],
        published: {
            type: Boolean,
            default: false,
        },
        publishDate: {
            type: Date,
        },
        views: {
            type: Number,
            default: 0,
        },
        channel: {
            type: String,
            required: true,
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
    if (this.published && !this.publishDate) {
        this.publishDate = new Date();
    }
    if (this.status) {
        const canUpdate = VideoValidatons.canChangeStatus(this.status, this as IVideo);

        if (!canUpdate) {
            const error = this.invalidate(
                'status',
                `Path 'status' cannot be changed unless all required fields are valid`,
                this.status,
            ) as mongoose.ValidationError;

            next(error);
        }
    }

    next();
});

export const VideoModel = mongoose.model<IVideo & mongoose.Document>('Video', videoSchema);
