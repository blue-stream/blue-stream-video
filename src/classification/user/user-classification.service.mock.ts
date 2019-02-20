import * as MockAdapter from 'axios-mock-adapter';
import { HttpClient } from '../../utils/http.client';
import { stringify } from 'querystring';

export class UserClassificationsServiceMock {

    private static mock: any;

    static startMock() {
        UserClassificationsServiceMock.mock = new MockAdapter.default(HttpClient.axiosInstance);

        UserClassificationsServiceMock.mock.onGet(`/userPermissions?${stringify({ userName: 'c@moreThenLittle' })}`).reply(200, {
            classification: 3,
            classificationsAllow: [
                {
                    classificationId: 3,
                    classificationLayer: 2,
                },
                {
                    classificationId: 7,
                    classificationLayer: 4,
                },
                {
                    classificationId: 55,
                    classificationLayer: 0,
                },
                {
                    classificationId: 39,
                    classificationLayer: 1,
                },
                {
                    classificationId: 2,
                    classificationLayer: 2,
                },
                {
                    classificationId: 76,
                    classificationLayer: 3,
                },
                {
                    classificationId: 37,
                    classificationLayer: 1,
                },
            ],
            ppAllow: [
                {
                    ppId: 5,
                    ppType: 'a',
                },
                {
                    ppId: 66,
                    ppType: 'b',
                },
                {
                    ppId: 35,
                    ppType: 'b',
                },
                {
                    ppId: 15,
                    ppType: 'a',
                },
                {
                    ppId: 10,
                    ppType: 'b',
                },
                {
                    ppId: 73,
                    ppType: 'a',
                },
                {
                    ppId: 24,
                    ppType: 'a',
                },
            ],
        });

        UserClassificationsServiceMock.mock.onGet(`/userPermissions?${stringify({ userName: 'a@none' })}`).reply(200, {
            classification: 3,
            classificationsAllow: [],
            ppAllow: [],
        });

        UserClassificationsServiceMock.mock.onGet(`/userPermissions?${stringify({ userName: 'unknown@user' })}`).reply(200, null);
    }

    static stopMock() {
        UserClassificationsServiceMock.mock.restore();
    }
}
