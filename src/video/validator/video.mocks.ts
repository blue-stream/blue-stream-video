import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';
import { IVideo } from '../video.interface';

export const responseMock = createResponse();

export class ValidRequestMocks {

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    videos: IVideo[] = [
        {
            contentUrl: 'https://www.youtube.com/watch?v=YkgkThdzX-8',
            description: 'John Lennon',
            owner: 'john@lenon',
            title: 'Imagine - John Lennon',
            views: 157,
            thumbnailUrl: 'https://yt3.ggpht.com/a-/ACSszfE1bmbrfGYUWaNbkn1UWPiwKiQzOJ0it_oupg=s288-mo-c-c0xffffffff-rj-k-no',
        },
        {
            title: 'BOB DYLAN - Mr Tambourine Man',
            description: `Subterranean Homesick Blues: A Tribute to Bob Dylan's 'Bringing It All Back Home'`,
            owner: 'bob@dylan',
            views: 38169017,
            contentUrl: 'https://www.youtube.com/watch?v=PYF8Y47qZQY',
            thumbnailUrl: 'http://lh3.googleusercontent.com/w8qfEEDmQ-wPQBX5SVCne2ehV-oZrpIX6WdDTamHfh8ZRrl5Y3AsdkfHtatMnxLZVV1z7LmRdh9sDYHRtQQ=s176-c-k-c0x00ffffff-no-rj',
        },
        {
            title: 'OFFICIAL Somewhere over the Rainbow - Israel "IZ" Kamakawiwoʻole',
            description: `Israel "IZ" Kamakawiwoʻole's Platinum selling hit "Over the Rainbow" OFFICIAL video produced by Jon de Mello for The Mountain Apple Company • HAWAI`,
            owner: 'mountain@apple',
            views: 579264778,
            contentUrl: 'https://www.youtube.com/watch?v=V1bFr2SWP1I',
            thumbnailUrl: 'https://yt3.ggpht.com/a-/AN66SAxZyTsOYDydiDuDzlWvf4cXAxDCoFYij5nkNg=s48-mo-c-c0xffffffff-rj-k-no',
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
