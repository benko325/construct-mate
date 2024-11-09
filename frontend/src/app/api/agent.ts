import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { router } from '../router/Routes';

const apiUrl = import.meta.env.VITE_API_URL;

const responseBody = (response: AxiosResponse) => response.data;

const requests = {
    get: (url: string, params?: URLSearchParams) => axios.get(url, {params}).then(responseBody),
    post: (url: string, body: object) => axios.post(url, body).then(responseBody),
    put: (url: string, body: object) => axios.put(url, body).then(responseBody),
    del: (url: string) => axios.delete(url).then(responseBody),
    postForm: (url: string, data: FormData) => axios.post(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody),
    putForm: (url: string, data: FormData) => axios.put(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody)
}

// axios.interceptors.request.use(config => {
//     const token = store.getState().account.user?.token;
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// })

const Account = {
    login: (values: any) => requests.post(`${apiUrl}/users/login`, values),
    register: (values: any) => requests.post(`${apiUrl}/users/register`, values),
    currentUser: () => requests.get(`${apiUrl}/users/me`),
}

const agent = {
    Account
}

export default agent;