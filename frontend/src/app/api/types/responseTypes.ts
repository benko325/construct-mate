import { UUID } from "crypto";

export interface AuthResponse {
    message: string;
}
  
export interface UserInfo {
    id: UUID;
    name: string;
    email: string;
}

export interface Construction {
    id: UUID;
    name: string;
    description: string | null;
    profilePictureUrl: string;
    buildingPermitFileUrl: string | null;
    constructionApprovalFileUrl: string | null;
    constructionHandoverFileUrl: string | null;
    ownerId: UUID;
    startDate: string;
    endDate: string;
    files: UploadedFile[];
    constructionDiary: ConstructionDiary | null;
}

export interface UploadedFile {
    id: UUID;
    filePath: string;
    filePurpose: number; //enum ??
    fileSize: number;
    createdAt: string;
}

export interface ConstructionDiary {
    id: UUID;
    createdAt: string;
    diaryDateFrom: string;
    diaryDateTo: string;
    constructionManager: string;
    constructionSupervisor: string;
    name: string;
    address: string;
    constructionApproval: string;
    investor: string;
    implementer: string;
    diaryContributors: DiaryContributor[];
    dailyRecords: DailyRecord[];
}

interface DiaryContributor {
    contributorId: UUID;
    contributorRole: number //enum
}

interface DailyRecord {
    date: string;
    weather: DiaryRecord[];
    workers: DiaryRecord[];
    machines: DiaryRecord[];
    work: DiaryRecord[];
    otherRecords: DiaryRecord[];
}

interface DiaryRecord {
    content: string;
    createdAt: string;
    authorName: string;
    authorRole: number; //enum
    picturePath: string | null; // for now no pictures in the diary, in future maybe
}