import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';
import { IVideo, VideoStatus } from '../video.interface';

export const responseMock = createResponse();

export class ValidRequestMocks {

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    videos: IVideo[] = [
        {
            description: 'John Lennon',
            owner: 'user@domain',
            title: 'Imagine - John Lennon',
            views: 157,
            contentPath: 'PYF8Y47qZQY.mp4',
            thumbnailPath: 'ACSszfE1bmbrfGYUWaNbkn1UWPiwKiQzOJ0it.bmp',
            status: VideoStatus.READY,
        },
        {
            title: 'BOB DYLAN - Mr Tambourine Man',
            description: `Subterranean Homesick Blues: A Tribute to Bob Dylan's 'Bringing It All Back Home'`,
            owner: 'user@domain',
            views: 38169017,
            contentPath: 'PYF8Y47qZQY.mp4',
            thumbnailPath: 'wPQBX5SVCne2ehV.jpeg',
            status: VideoStatus.READY,
        },
        {
            title: 'OFFICIAL Somewhere over the Rainbow - Israel "IZ" Kamakawiwoʻole',
            description: `Israel "IZ" Kamakawiwoʻole's Platinum selling hit "Over the Rainbow" OFFICIAL video produced by Jon de Mello for The Mountain Apple Company • HAWAI`,
            owner: 'user@domain',
            views: 579264778,
            contentPath: 'V1bFr2SWP1I.mp4',
            thumbnailPath: 'AN66SAxZyTsOYDydiDuDzlWvf4cXAxDCoFYij5nkNg.png',
            status: VideoStatus.READY,
        },
    ];

    create = createRequest({
        method: 'POST',
        url: '/api/video/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            ...this.videos[0],
        },
        user: {
            id: 'user@domain',
        },
    });

    updateById = createRequest({
        method: 'PUT',
        url: '/api/video/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
        body: {
            title: 'New title',
        },
    });

    deleteById = createRequest({
        method: 'DELETE',
        url: '/api/video/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
    });

    getOne = createRequest({
        method: 'GET',
        url: `/api/video/one?videoFilter={'property':'12345'}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: '12345',
        },
    });

    getMany = createRequest({
        method: 'GET',
        url: `/api/video/?videoFilter={'property':'12345'}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: '12345',
        },
    });

    getAmount = createRequest({
        method: 'GET',
        url: `/api/video/amount?videoFilter={'property':'12345'}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: '12345',
        },
    });

    getById = createRequest({
        method: 'GET',
        url: '/api/video/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
    });
}
