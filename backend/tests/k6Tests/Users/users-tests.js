import { group } from 'k6';
import { UsersTests } from './users-test-methods.js';

const tests = new UsersTests();

export default function() {
    group('Users Tests', function () {
        group('Create New User Test', function () {
            tests.CreateNewUserTest();
        })
        group('Login User Test', function () {
            tests.LoginUserTest();
        })
        group('Get User Test', function () {
            tests.GetUserTest();
        })
        group('Modify User Name And Email Test', function () {
            tests.ModifyUserNameEmailTest();
        })
        group('Modify User Password Test', function () {
            tests.ModifyUserPasswordTest();
        })
        group('Get User After Modify Test', function () {
            tests.GetUserAfterModifyTest();
        })
        // group('Delete User Test', function () {
        //     tests.DeleteUserTest();
        // })
        // group('Logout User Test', function () {
        //     tests.LogoutUserTest();
        // })
    })
}