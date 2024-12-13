import { ApiBase } from "../api-base.js";
import http from 'k6/http';
import { check } from "k6";

let baseUrl;
let params;
let usersApiUrl;

let testUserId;

const firstName = "Test";
const lastName = "User";
var modifiedFirstName = "New Test";
var modifiedLastName = "User0";
var modifiedEmail = "modified-test-mail@testing.com";
const email = "test-mail@testing.com";
const password = "1Astring";
const modifiedPassword = "12Astring";

export class UsersTests extends ApiBase {
    constructor() {
        super();
        baseUrl = this.baseUrl;
        params = this.params;
        usersApiUrl = `${this.baseUrl}users/`;
    }

    CreateNewUserTest() {
        const payload = JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            passwordAgain: password,
        });

        let response = http.post(usersApiUrl, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Create user is status 200': r => r.status === 200,
            'Create user has id': body.hasOwnProperty('id'),
            'Create user has correct firstName field': body.firstName === firstName,
            'Create user has correct lastName field': body.lastName === lastName,
            'Create user has correct email field': body.email === email,
        });

        testUserId = body.id;
    }

    LoginUserTest() {
        const payload = JSON.stringify({
            email: email,
            password: password,
        });

        let response = http.post(`${this.baseUrl}auth/token`, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Login user is status 200': r => r.status === 200,
            'Login user has token': body.hasOwnProperty('token'),
            'Login user has expiration': body.hasOwnProperty('expiration'),
        });
    }

    GetUserTest() {
        let response = http.get(`${usersApiUrl}me`, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Get user is status 200': r => r.status === 200,
            'Get user has id': body.hasOwnProperty('id'),
            'Get user has correct id': body.id === testUserId,
            'Get user has name': body.hasOwnProperty('name'),
            'Get user has correct name': body.name === firstName + " " + lastName,
            'Get user has email': body.hasOwnProperty('email'),
            'Get user has correct email': body.email === email,
        });
    }

    ModifyUserNameEmailTest() {
        const payload = JSON.stringify({
            newFirstName: modifiedFirstName,
            newLastName: modifiedLastName,
            newEmail: modifiedEmail,
        });

        let response = http.patch(usersApiUrl, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Modify user is status 200': r => r.status === 200,
            'Modify user has correct id': body.id === testUserId,
            'Modify user has correct firstName field': body.firstName === modifiedFirstName,
            'Modify user has correct lastName field': body.lastName === modifiedLastName,
            'Modify user has correct email field': body.email === modifiedEmail,
            'Modify user has newToken field': body.hasOwnProperty('newToken'),
        });
    }

    ModifyUserPasswordTest() {
        const payload = JSON.stringify({
            oldPassword: password,
            newPassword: modifiedPassword,
            newPasswordAgain: modifiedPassword,
        });

        let response = http.patch(`${usersApiUrl}password`, payload, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Modify user password is status 200': r => r.status === 200,
            'Modify user password has correct id': body.id === testUserId
        });
    }

    GetUserAfterModifyTest() {
        let response = http.get(`${usersApiUrl}me`, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Get user after modify is status 200': r => r.status === 200,
            'Get user after modify has id': body.hasOwnProperty('id'),
            'Get user after modify has correct id': body.id === testUserId,
            'Get user after modify has name': body.hasOwnProperty('name'),
            'Get user after modify has correct name': body.name === modifiedFirstName + " " + modifiedLastName,
            'Get user after modify has email': body.hasOwnProperty('email'),
            'Get user after modify has correct email': body.email === modifiedEmail,
        });
    }

    DeleteUserTest() {
        let response = http.del(`${usersApiUrl}${testUserId}`, null, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Delete user is status 200': r => r.status === 200,
            'Delete user has id': body.hasOwnProperty('id'),
            'Delete user has correct id field': body.id === testUserId,
        });
    }

    LogoutUserTest() {
        let response = http.del(`${baseUrl}auth/token`, null, params);
        let body = JSON.parse(response.body);

        check(response, {
            'Logout user is status 200': r => r.status === 200,
            'Logout user has id': body.hasOwnProperty('id'),
            'Logout user has correct id field': body.id === testUserId,
        });
    }
}