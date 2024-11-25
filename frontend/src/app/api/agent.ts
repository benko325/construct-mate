import axios, { AxiosError, AxiosResponse } from "axios";
import { ChangeUserPasswordRequest, CreateConstructionRequest, LoginUserRequest, RegisterUserRequest, SetUserNameAndEmailRequest, UpdateConstructionNameAndDescriptionRequest, UpdateConstructionStartEndDateRequest } from "./types/requestTypes";
import { UUID } from "crypto";

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
// });

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
    patch: (url: string, body: object) => apiClient.patch(url, body).then(responseBody),
    put: (url: string, body: object) => apiClient.put(url, body).then(responseBody),
    del: (url: string) => apiClient.delete(url).then(responseBody),
    postForm: (url: string, data: FormData) => apiClient.post(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody),
    putForm: (url: string, data: FormData) => apiClient.put(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody)
};

const Account = {
    login: (values: LoginUserRequest) => requests.post(`/users/login`, values),
    logout: () => requests.del(`/users/logout`),
    register: (values: RegisterUserRequest) => requests.post(`/users/register`, values),
    getNameAndEmail: () => requests.get(`/users/name-email`),
    setNameAndEmail: (values: SetUserNameAndEmailRequest) => requests.patch(`/users`, values),
    changePassword: (values: ChangeUserPasswordRequest) => requests.patch(`/users/password`, values),
    currentUser: () => requests.get(`/users/me`), // is also used to verify if the user is logged-in
};

const Construction = {
    createNew: (values: CreateConstructionRequest) => requests.post(`/constructions`, values),
    getConstructionById: (id: UUID) => requests.get(`/constructions/${id}`),
    getAllUnfinished: () => requests.get(`/constructions`),
    getAllFinished: () => requests.get(`/finished-constructions`),
    updateNameAndDescription: (id: UUID, values: UpdateConstructionNameAndDescriptionRequest) => requests.patch(`/constructions/${id}`, values),
    updateStartEndDate: (id: UUID, values: UpdateConstructionStartEndDateRequest) => requests.patch(`/constructions/${id}/start-end-date`, values),
    uploadProfilePicture: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/profile-picture`, data),
    uploadBuildingPermit: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/building-permit`, data),
    deleteBuildingPermit: (id: UUID) => requests.del(`/constructions/${id}/building-permit`),
    uploadConstructionApproval: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/construction-approval`, data),
    deleteConstructionApproval: (id: UUID) => requests.del(`/constructions/${id}/construction-approval`),
    uploadConstructionHandover: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/construction-handover`, data),
    deleteConstructionHandover: (id: UUID) => requests.del(`/constructions/${id}/construction-handover`),
};

const agent = {
    Account,
    Construction
};

export default agent;