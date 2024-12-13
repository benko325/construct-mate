import { group } from 'k6';
import { ConstructionsTests } from './constructions-test-methods.js';

const tests = new ConstructionsTests();

export default function() {
    group('Constructions Tests', function () {
        group('Create New Construction Test', function () {
            tests.CreateNewConstructionTest();
        })
        group('Upload New File To Construction Test', function () {
            tests.UploadNewFileToConstructionTest();
        })
        group('Delete File From Construction Test', function () {
            tests.DeleteFileFromConstructionTest();
        })
        group('Get Construction Test', function () {
            tests.GetConstructionTest();
        })
        group('Get All Unfinished Constructions Test', function () {
            tests.GetAllUnfinishedConstructionsTest();
        })
        group('Modify Construction Name And Description Test', function () {
            tests.ModifyConstructionNameDescriptionTest();
        })
        group('Modify Construction Start And End Date Test', function () {
            tests.ModifyConstructionDatesTest();
        })
        group('Get Construction After Modify Test', function () {
            tests.GetConstructionAfterModifyTest();
        })
        group('Get All Finished Constructions Test', function () {
            tests.GetAllFinishedConstructionsTest();
        })
        group('Delete Construction Test', function () {
            tests.DeleteConstructionTest();
        })
    })
}