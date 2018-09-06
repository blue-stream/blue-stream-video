import * as mongoose from 'mongoose';
import { IVideo } from './video.interface';

const videoSchema: mongoose.Schema = new mongoose.Schema(
    {
        property: { type: String, required: true },
    },
    {
        autoIndex: false,
        timestamps: true,
        id: true,
    });

export const VideoModel = mongoose.model<IVideo & mongoose.Document>('Video', videoSchema);
