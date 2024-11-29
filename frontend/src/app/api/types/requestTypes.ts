import { UUID } from "crypto";

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface RegisterUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordAgain: string;
}

export interface SetUserNameAndEmailRequest {
    newFirstName: string;
    newLastName: string;
    newEmail: string;
}

export interface ChangeUserPasswordRequest {
    oldPassword: string;
    newPassword: string;
    newPasswordAgain: string;
}

export interface CreateConstructionRequest {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
}

export interface UpdateConstructionNameAndDescriptionRequest {
    id: UUID;
    name: string;
    description: string;
}

export interface UpdateConstructionStartEndDateRequest {
    constructionId: UUID;
    startDate: string;
    endDate: string;
}

export interface CreateNewConstructionDiaryRequest {
    diaryDateFrom: string,
    diaryDateTo: string,
    constructionManager: string,
    constructionSupervisor: string,
    name: string,
    address: string,
    constructionApproval: string,
    investor: string,
    implementer: string,
    updateConstructionDates: boolean
}

export interface CreateNewDiaryRecordRequest {
    content: string,
    recordCategory: DiaryRecordCategory
}

export enum DiaryRecordCategory {
    None,
    Weather,
    Workers,
    Machines,
    Work,
    OtherRecords,
}