export interface IVideo {
    id?: string;
    title: string;
    channel: string;
    description: string;
    views?: number;
    owner: string;
    thumbnailPath: string;
    contentPath: string;
    previewPath?: string;
    originalPath?: string;
    status?: VideoStatus;
    tags?: string[];
    published?: boolean;
    publishDate?: Date;
    classificationSource?: number;
}

export enum VideoStatus {
    UPLOADED = 'UPLOADED',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    READY = 'READY',
}
