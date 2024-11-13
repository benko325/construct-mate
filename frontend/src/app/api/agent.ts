import axios, { AxiosError, AxiosResponse } from "axios";
import { axiosInstance, responseBody } from './axiosInstance.ts';
import { toast } from 'react-toastify';
import { router } from '../router/Routes';
import { error } from "console";

const apiUrl = import.meta.env.VITE_API_URL;

// axios.interceptors.response.use(async response => {
//     return response
// }, (error: AxiosError) => {
//     const {data, status} = error.response as AxiosResponse;
//     switch (status) {
//         case 400:
//             toast.error(data.title);
//             break;
//         case 401:
//             toast.error(data.title);
//             break;
//     }
// })

// Create an Axios instance for API requests
const apiClient = axios.create({
    baseURL: apiUrl,
    withCredentials: true, // Send cookies with each request
});

const requests = {
    get: (url: string, params?: URLSearchParams) => apiClient.get(url, {params}).then(responseBody),
    post: (url: string, body: object) => apiClient.post(url, body).then(responseBody),
    put: (url: string, body: object) => apiClient.put(url, body).then(responseBody),
    del: (url: string) => apiClient.delete(url).then(responseBody),
    postForm: (url: string, data: FormData) => apiClient.post(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody),
    putForm: (url: string, data: FormData) => apiClient.put(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody)
}

// axios.interceptors.request.use(config => {
//     const token = store.getState().account.user?.token;
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// })

const Account = {
    login: (values: any) => requests.post(`/users/login`, values),
    register: (values: any) => requests.post(`/users/register`, values),
    currentUser: () => requests.get(`/users/me`),
}

const agent = {
    Account
}

export default agent;