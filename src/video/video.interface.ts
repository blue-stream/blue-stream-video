export interface IVideo {
    id?: string;
    title: string;
    description: string;
    views: number;
    owner: string;
    thumbnailUrl: string;
    contentUrl: string;
    status?: VideoStatus;
}

export enum VideoStatus {
    UPLOADED = 'UPLOADED',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    READY = 'READY',
}
