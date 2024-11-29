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
    name: string;
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

export interface DiaryContributor {
    contributorId: UUID;
    contributorRole: DiaryContributorRole;
}

export interface DailyRecord {
    date: string;
    weather: DiaryRecord[];
    workers: DiaryRecord[];
    machines: DiaryRecord[];
    work: DiaryRecord[];
    otherRecords: DiaryRecord[];
}

export interface DiaryRecord {
    content: string;
    createdAt: string;
    authorName: string;
    authorRole: DiaryContributorRole;
    picturePath: string | null; // for now no pictures in the diary, in future maybe
}

export enum DiaryContributorRole {
    None = 0,
    ConstructionManager = 1, // Stavbyvedúci
    GovernmentalConstructionSupervisor = 2, // Štátny stavebný dozor
    Cartographer = 3, // Geodet a kartograf
    ConstructionOwner = 4, // Stavebník alebo vlastník stavby
    Designer = 5, // Projektant
    ConstructionSupplier = 6, // Zhotoviteľ stavby
    ConstructionControl = 7, // Stavebný dozor
    GovernmentalControl = 8, // Štátny dozor
    ConstructionWorkSafetyCoordinator = 9, // Koordinátor bezpečnosti práce
}