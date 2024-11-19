import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from 'react-toastify';
import { router } from '../router/Routes';
import { error } from "console";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const responseBody = (response: AxiosResponse) => response.data;

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

// axiosInstance.interceptors.response.use(
//     (response: any) => response,
//     (error: AxiosError) => {
//         if (error.response) {
//         // Server responded with a status other than 200 range
//         console.error('Response error:', error.response.status, error.response.data);
//         } else if (error.request) {
//         // Request was made but no response was received
//         console.error('Request error:', error.request);
//         } else {
//         // Something happened in setting up the request
//         console.error('Error message:', error.message);
//         }

//         // Optionally, you can throw custom errors based on status
//         if (error.response?.status === 401) {
//         // Unauthorized error handling, e.g., redirect to login
//         }

//         return Promise.reject(error);
//     }
// );

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

const Account = {
    login: (values: any) => requests.post(`/users/login`, values),
    logout: () => requests.del(`/users/logout`),
    register: (values: any) => requests.post(`/users/register`, values),
    currentUser: () => requests.get(`/users/me`), // is also used to verify if the user is logged-in
}

const agent = {
    Account
}

export default agent;