import { ApiBase } from "../api-base.js";
import http from 'k6/http';
import { check } from "k6";

let baseUrl;
let params;
let constructionsApiUrl;

const name = "Test Construction";
const description = "Test Construction Description";
const startDate = "2024-12-01";
const endDate = "9999-12-12";

const modifiedName = "Modified Test Name";
const modifiedDescription = "Modified Test Description";
const modifiedStartDate = "2024-10-02";
const modifiedEndDate = "2024-12-12";

let testConstructionId;

export class ConstructionsTests extends ApiBase {
    constructor() {
        super();
        baseUrl = this.baseUrl;
        params = this.params;
        constructionsApiUrl = `${this.baseUrl}constructions/`;
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
            'Create construction has correct lastName field': body.description === description,
            'Create construction has correct startDate field': body.startDate === startDate,
            'Create construction has correct endDate field': body.endDate === endDate,
        });

        testConstructionId = body.id;
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