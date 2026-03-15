export interface loginRequest {
    phone: string;
    password: string;
}


export interface loginResponse {
    success: boolean;
    data: LoginSuccessResponse | LoginFailureResponse
}

export interface LoginSuccessResponse {
    token: string;
}

export type LoginFailureResponse = {
    reason:string
}
export interface registerRequest {
    phone: string;
    password: string;
}

export interface registerResponse {
    success: boolean;
    reason?: string;
}

export interface UserInfoRes {}
