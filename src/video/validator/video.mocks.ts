import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';

export const responseMock = createResponse();

export class ValidRequestMocks {

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    create = createRequest({
        method: 'POST',
        url: '/api/video/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            video: {
                property: '12345',
            },
        },
    });

    createMany = createRequest({
        method: 'POST',
        url: '/api/video/many/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            videos: [{
                property: '12345',
            },
            {
                property: '34567',
            },
            {
                property: '56789',
            }],
        },
    });

    updateMany = createRequest({
        method: 'PUT',
        url: '/api/video/many',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            videoFilter: {
                property: '12345',
            },
            video: {
                property: '12345',
            },
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
            video: {
                property: '12345',
            },
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
        url: `/api/video/many?videoFilter={'property':'12345'}`,
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
