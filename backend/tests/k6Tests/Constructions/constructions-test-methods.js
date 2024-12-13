import { ApiBase } from "../api-base.js";
import http from 'k6/http';
import { check } from "k6";
import { FormData } from "../utils/form-data.js";

let baseUrl;
let params;
let constructionsApiUrl;
let diariesApiUrl;

const name = "Test Construction";
const description = "Test Construction Description";
const startDate = "2024-12-01";
const endDate = "9999-12-12";

const modifiedName = "Modified Test Name";
const modifiedDescription = "Modified Test Description";
const modifiedStartDate = "2024-10-02";
const modifiedEndDate = "2024-12-12";
const today = new Date();
const todayDateOnly = today.toISOString().split('T')[0];

const nonEmptyString = "AaAaAaaaaaaaaaaBBbb";

const fileData = open('./test-image.png', 'b');
const fileName = `test-image.png`;

let fileId;
let testConstructionId;
let testDiaryId;

export class ConstructionsTests extends ApiBase {
    constructor() {
        super();
        baseUrl = this.baseUrl;
        params = this.params;
        constructionsApiUrl = `${this.baseUrl}constructions/`;
        diariesApiUrl = `${this.baseUrl}construction-diaries/`;
    }

    CreateNewConstructionTest() {
        const payload = JSON.stringify({
            name: name,
            description: description,
            startDate: startDate,
            endDate: endDate,
        });

        let response = http.post(constructionsApiUrl, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Create construction is status 200': r => r.status === 200,
            'Create construction has id': body.hasOwnProperty('id'),
            'Create construction has correct name field': body.name === name,
            'Create construction has correct description field': body.description === description,
            'Create construction has correct startDate field': body.startDate === startDate,
            'Create construction has correct endDate field': body.endDate === endDate,
        });

        testConstructionId = body.id;
    }

    UploadNewFileToConstructionTest() {
        const formData = new FormData();

        const file = http.file(fileData, fileName);

        formData.append('image', file);

        const uploadParams = {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData.boundary}`,
            },
        };

        const response = http.post(constructionsApiUrl + `${testConstructionId}/files`, formData.body(), uploadParams);
        let body = JSON.parse(response.body);

        check(response, {
            'Upload file to construction is status 200': r => r.status === 200,
            'Upload file to construction has id': body.hasOwnProperty('id'),
            'Upload file to construction has constructionId': body.hasOwnProperty('constructionId'),
            'Upload file to construction has correct constructionId': body.constructionId === testConstructionId,
            'Upload file to construction has filePath': body.hasOwnProperty('filePath'),
            'Upload file to construction has name': body.hasOwnProperty('name'),
            'Upload file to construction has correct name': body.name === fileName,
        });

        fileId = body.id;
    }

    DeleteFileFromConstructionTest() {
        let response = http.del(`${constructionsApiUrl}${testConstructionId}/files/${fileId}`, null, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Delete file from construction is status 200': r => r.status === 200,
            'Delete file from construction has fileId': body.hasOwnProperty('fileId'),
            'Delete file from construction has correct fileId': body.fileId === fileId,
            'Delete file from construction has constructionId': body.hasOwnProperty('constructionId'),
            'Delete file from construction has correct constructionId': body.constructionId === testConstructionId,
        })
    }

    GetConstructionTest() {
        let response = http.get(`${constructionsApiUrl}${testConstructionId}`, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Get construction is status 200': r => r.status === 200,
            'Get construction has id': body.hasOwnProperty('id'),
            'Get construction has correct id': body.id === testConstructionId,
            'Get construction has name': body.hasOwnProperty('name'),
            'Get construction has correct name': body.name === name,
            'Get construction has description': body.hasOwnProperty('description'),
            'Get construction has correct description': body.description === description,
            'Get construction has correct startDate': body.startDate === startDate,
            'Get construction has correct endDate': body.endDate === endDate,
        });
    }

    GetAllUnfinishedConstructionsTest() {
        let response = http.get(constructionsApiUrl, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Get all unfinished constructions is status 200': r => r.status === 200,
            'Get all unfinished constructions contains correct construction': body.some(item => item.id == testConstructionId)
        });
    }

    CreateNewDiaryTest() {
        const payload = JSON.stringify({
            diaryDateFrom: startDate,
            diaryDateTo: "2025-12-12",
            constructionManager: nonEmptyString,
            constructionSupervisor: nonEmptyString,
            name: nonEmptyString,
            address: nonEmptyString,
            constructionApproval: nonEmptyString,
            investor: nonEmptyString,
            implementer: nonEmptyString,
            updateConstructionDates: false
        });

        let response = http.post(`${constructionsApiUrl}${testConstructionId}/diary`, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Create diary is status 200': r => r.status === 200,
            'Create diary has id': body.hasOwnProperty('id'),
            'Create diary has correct constructionId field': body.constructionId === testConstructionId,
            'Create diary has correct name field': body.name === nonEmptyString,
            'Create diary has correct address field': body.address === nonEmptyString,
            'Create diary has correct investor field': body.investor === nonEmptyString,
            'Create diary has correct implementer field': body.implementer === nonEmptyString,
            'Create diary has correct constructionApproval field': body.constructionApproval === nonEmptyString,
            'Create diary has correct constructionSupervisor field': body.constructionSupervisor === nonEmptyString,
            'Create diary has correct constructionManager field': body.constructionManager === nonEmptyString,
            'Create diary has correct diaryDateFrom field': body.diaryDateFrom === startDate,
            'Create diary has correct diaryDateTo field': body.diaryDateTo === "2025-12-12",
        });

        testDiaryId = body.id;
    }

    GetDiaryTest() {
        let response = http.get(`${constructionsApiUrl}${testConstructionId}/diary`, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Get diary is status 200': r => r.status === 200,
            'Get diary has id': body.hasOwnProperty('id'),
            'Get diary has correct id': body.id === testDiaryId,
            'Get diary has correct name field': body.name === nonEmptyString,
            'Get diary has correct address field': body.address === nonEmptyString,
            'Get diary has correct investor field': body.investor === nonEmptyString,
            'Get diary has correct implementer field': body.implementer === nonEmptyString,
            'Get diary has correct constructionApproval field': body.constructionApproval === nonEmptyString,
            'Get diary has correct constructionSupervisor field': body.constructionSupervisor === nonEmptyString,
            'Get diary has correct constructionManager field': body.constructionManager === nonEmptyString,
            'Get diary has correct diaryDateFrom field': body.diaryDateFrom === startDate,
            'Get diary has correct diaryDateTo field': body.diaryDateTo === "2025-12-12",
        });
    }

    ModifyDiaryFromToDatesTest() {
        const payload = JSON.stringify({
            newDateFrom: modifiedStartDate,
            newDateTo: todayDateOnly,
            updateConstructionDates: false
        });

        let response = http.put(`${diariesApiUrl}${testDiaryId}/dates`, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Modify diary dates is status 200': r => r.status === 200,
            'Modify diary dates has diaryId': body.hasOwnProperty('diaryId'),
            'Modify diary dates has correct diaryId': body.diaryId === testDiaryId,
            'Modify diary dates has correct newDateFrom field': body.newDateFrom === modifiedStartDate,
            'Modify diary dates has correct newDateTo field': body.newDateTo === todayDateOnly,
        });
    }

    AddNewDiaryRecordTest() {
        const payload = JSON.stringify({
            content: nonEmptyString,
            recordCategory: 1,
        });

        let response = http.post(`${diariesApiUrl}${testDiaryId}/diary-text-records`, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Add new diary record is status 200': r => r.status === 200,
            'Add new diary record has diaryId': body.hasOwnProperty('diaryId'),
            'Add new diary record has correct diaryId field': body.diaryId === testDiaryId,
            'Add new diary record has correct content field': body.content === nonEmptyString,
        });
    }

    ModifyConstructionNameDescriptionTest() {
        const payload = JSON.stringify({
            id: testConstructionId,
            name: modifiedName,
            description: modifiedDescription,
        });

        let response = http.patch(`${constructionsApiUrl}${testConstructionId}`, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Modify construction is status 200': r => r.status === 200,
            'Modify construction has correct id field': body.id === testConstructionId,
            'Modify construction has correct name field': body.name === modifiedName,
            'Modify construction has correct description field': body.description === modifiedDescription,
        });
    }

    ModifyConstructionDatesTest() {
        const payload = JSON.stringify({
            constructionId: testConstructionId,
            startDate: modifiedStartDate,
            endDate: modifiedEndDate,
        });

        let response = http.patch(`${constructionsApiUrl}${testConstructionId}/dates`, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Modify construction dates is status 200': r => r.status === 200,
            'Modify construction dates has correct constructionId field': body.constructionId === testConstructionId,
            'Modify construction has correct newStartDate field': body.newStartDate === modifiedStartDate,
            'Modify construction has correct newEndDate field': body.newEndDate === modifiedEndDate,
        });
    }

    GetConstructionAfterModifyTest() {
        let response = http.get(`${constructionsApiUrl}${testConstructionId}`, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Get construction after modify is status 200': r => r.status === 200,
            'Get construction after modify has id': body.hasOwnProperty('id'),
            'Get construction after modify has correct id': body.id === testConstructionId,
            'Get construction after modify has name': body.hasOwnProperty('name'),
            'Get construction after modify has correct name': body.name === modifiedName,
            'Get construction after modify has description': body.hasOwnProperty('description'),
            'Get construction after modify has correct description': body.description === modifiedDescription,
            'Get construction after modify has correct startDate': body.startDate === modifiedStartDate,
            'Get construction after modify has correct endDate': body.endDate === modifiedEndDate,
        });
    }

    GetAllFinishedConstructionsTest() {
        let response = http.get(`${baseUrl}finished-constructions`, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Get all finished constructions is status 200': r => r.status === 200,
            'Get all finished constructions contains correct construction': body.some(item => item.id == testConstructionId)
        });
    }

    DeleteConstructionTest() {
        let response = http.del(`${constructionsApiUrl}${testConstructionId}`, null, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Delete construction is status 200': r => r.status === 200,
            'Delete construction has id': body.hasOwnProperty('id'),
            'Delete construction has correct id field': body.id === testConstructionId,
        });
    }
}