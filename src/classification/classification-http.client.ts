import axios, { AxiosInstance } from 'axios';
import { stringify } from 'querystring';
import { config } from '../config';

export class ClassificationHttpClient {
    static axiosInstance: AxiosInstance = axios.create({
        baseURL: config.classifications.service.baseUrl,
        headers: {
            Authorization: `Bearer ${config.classifications.token}`,
        },
    });

    static async get(url: string, query?: any) {
        return (await ClassificationHttpClient.axiosInstance.get(`${url}?${stringify(query)}`)).data;
    }
}
