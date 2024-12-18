import axios, { AxiosError, AxiosResponse } from "axios";
import { AddNewDiaryContributorRequest, ChangeUserPasswordRequest, CreateConstructionRequest, CreateNewConstructionDiaryRequest, CreateNewDiaryRecordRequest, LoginUserRequest, ModifyDiaryFromToDatesRequest, RegisterUserRequest, SetUserNameAndEmailRequest, UpdateConstructionNameAndDescriptionRequest, UpdateConstructionStartEndDateRequest } from "./types/requestTypes";
import { UUID } from "crypto";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const responseBody = (response: AxiosResponse) => response.data;

const apiClient = axios.create({
    baseURL: apiUrl,
    withCredentials: true, // Send cookies with each request
});

apiClient.interceptors.response.use(
    (response: any) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const navigate = useNavigate();
            navigate("/login");
        }

        return Promise.reject(error);
    }
);

const requests = {
    get: (url: string, params?: URLSearchParams) => apiClient.get(url, {params}).then(responseBody),
    getFile: (url: string, params?: URLSearchParams) => apiClient.get(url, {params, responseType: 'blob'}).then(responseBody),
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
    login: (values: LoginUserRequest) => requests.post(`/auth/token`, values),
    logout: () => requests.del(`/auth/token`),
    register: (values: RegisterUserRequest) => requests.post(`/users`, values),
    getNameAndEmail: () => requests.get(`/users/name-email`),
    setNameAndEmail: (values: SetUserNameAndEmailRequest) => requests.patch(`/users`, values),
    changePassword: (values: ChangeUserPasswordRequest) => requests.patch(`/users/password`, values),
    currentUser: () => requests.get(`/users/me`), // also used to verify if the user is logged-in
};

const Construction = {
    createNew: (values: CreateConstructionRequest) => requests.post(`/constructions`, values),
    getConstructionById: (id: UUID) => requests.get(`/constructions/${id}`),
    getAllUnfinished: () => requests.get(`/constructions`),
    getAllFinished: () => requests.get(`/finished-constructions`),
    updateNameAndDescription: (id: UUID, values: UpdateConstructionNameAndDescriptionRequest) => requests.patch(`/constructions/${id}`, values),
    updateStartEndDate: (id: UUID, values: UpdateConstructionStartEndDateRequest) => requests.patch(`/constructions/${id}/dates`, values),
    uploadProfilePicture: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/profile-picture`, data),
    uploadBuildingPermit: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/building-permit`, data),
    deleteBuildingPermit: (id: UUID) => requests.del(`/constructions/${id}/building-permit`),
    uploadConstructionApproval: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/construction-approval`, data),
    deleteConstructionApproval: (id: UUID) => requests.del(`/constructions/${id}/construction-approval`),
    uploadConstructionHandover: (id: UUID, data: FormData) => requests.postForm(`/constructions/${id}/construction-handover`, data),
    deleteConstructionHandover: (id: UUID) => requests.del(`/constructions/${id}/construction-handover`),
    deleteGeneralFile: (constructionId: UUID, fileId: UUID) => requests.del(`/constructions/${constructionId}/files/${fileId}`),
    // if files will have nice names
    // uploadGeneralFile: (constructionId: UUID, data: FormData, name: string | null) => requests.postForm(`/constructions/${constructionId}/files?fileName=${name}`, data),
    uploadGeneralFile: (constructionId: UUID, data: FormData) => requests.postForm(`/constructions/${constructionId}/files`, data),
};

const ConstructionDiary = {
    createNew: (id: UUID, values: CreateNewConstructionDiaryRequest) => requests.post(`/constructions/${id}/diary`, values),
    addNewRecord: (id: UUID, values: CreateNewDiaryRecordRequest) => requests.post(`/construction-diaries/${id}/diary-text-records`, values),
    addNewContributor: (id: UUID, values: AddNewDiaryContributorRequest) => requests.post(`/constructions/${id}/diary-contributors`, values),
    getUnfinishedDiariesWhereIAmContributor: () => requests.get(`/contribution-diaries`),
    getFinishedDiariesWhereIAmContributor: () => requests.get(`/my-finished-contribution-diaries`),
    modifyFromToDates: (id: UUID, values: ModifyDiaryFromToDatesRequest) => requests.put(`/construction-diaries/${id}/dates`, values),
    getFirstAndLastDayWithRecord: (id: UUID) => requests.get(`/construction-diaries/${id}/record-boundaries`),
    getAllContributorsInfo: (id: UUID) => requests.get(`/construction-diaries/${id}/contributors`),
    exportToPdf: (id: UUID) => requests.getFile(`/construction-diaries/${id}/export`),
};

const agent = {
    Account,
    Construction,
    ConstructionDiary,
};

export default agent;