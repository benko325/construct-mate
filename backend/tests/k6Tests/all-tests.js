import { group } from "k6";
import UsersTests from "./Users/users-tests.js";

export default function() {
    group("Construct Mate All Tests", function () {
        UsersTests();
    })
}