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