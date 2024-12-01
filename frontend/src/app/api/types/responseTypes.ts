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
    None,
    ConstructionManager, // stavbyveduci
    ConstructionSupervisor, // f) osoba vykonávajúca štátny stavebný dohľad alebo kontrolnú prehliadku stavby
    Surveyor, // c) geodet
    ConstructionOwner, // b) stavebník a vlastník stavby, ak nie je stavebníkom
    Designer, // a) generálny projektant a projektant častí projektovej dokumentácie
    BuildingInspector, // e) stavebny inšpektor alebo iny zamestnanec stavebného úradu
    ConstructionControl, // d) osoba vykonavajuca stavebny dozor
    GovernmentalControl, // l) oprávnena osoba orgánu vykonávajúceho štátny dohľad alebo dozor podľa osobitného predpisu
    ConstructionWorkSafetyCoordinator, // g) koordinátor projektovej dokumentácie, autorizovany bezpečnostny technik a koordinátor bezpečnosti na stavenisku
    ArchitecturalWorkAuthor, // h) autor architektonického diela pri výkone autorského dohľadu
    Geologist, // i) geolog a geotechnik
    PersonAuthorizedByAffectedLegalEntity, // k) osoba poverena dotknutou právnickou osobou
    ApartmentBuildingManager, // j) správca bytového domu alebo predseda spoločenstva vlastníkov bytov a nebytových priestorov, ak ide o zmenu stavby, o stavebnú úpravu alebo o údržbu bytového domu
}