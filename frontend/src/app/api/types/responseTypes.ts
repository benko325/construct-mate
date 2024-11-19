import { UUID } from "crypto";

export interface AuthResponse {
    message: string;
}
  
export interface UserInfo {
    id: UUID;
    name: string;
    email: string;
}
  