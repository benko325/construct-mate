import { group } from "k6";
import UsersAllTests from "./Users/users-tests.js";
import { UsersTests } from './Users/users-test-methods.js';
import ConstructionsAllTests from "./Constructions/constructions-tests.js";

const usersTests = new UsersTests();

export default function() {
    group("Construct Mate All Tests", function () {
        UsersAllTests();
        ConstructionsAllTests();
        group('Delete User Test', function () {
            usersTests.DeleteUserTest();
        })
        group('Logout User Test', function () {
            usersTests.LogoutUserTest();
        })
    })
}