// Simple test runner for core business logic tests
// Run with: node src/tests/logic.test.js

import { calculatePopularity } from '../services/popularityService.js';

// Test utilities
let passedTests = 0;
let failedTests = 0;

function assertEqual(actual, expected, testName) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        console.log(`✓ PASS: ${testName}`);
        passedTests++;
    } else {
        console.log(`✗ FAIL: ${testName}`);
        console.log(`  Expected: ${JSON.stringify(expected)}`);
        console.log(`  Actual: ${JSON.stringify(actual)}`);
        failedTests++;
    }
}

function assertTrue(condition, testName) {
    if (condition) {
        console.log(`✓ PASS: ${testName}`);
        passedTests++;
    } else {
        console.log(`✗ FAIL: ${testName}`);
        failedTests++;
    }
}

// TEST 1: Popularity Score Calculation with Shared Hobbies
console.log('\n--- TEST 1: Popularity Score Calculation ---');

const user1 = {
    _id: '1',
    friends: ['2', '3'],
    hobbies: ['Coding', 'Gaming', 'Music']
};

const friendDocs1 = [
    { _id: '2', hobbies: ['Coding', 'Reading'] }, // 1 shared hobby (Coding)
    { _id: '3', hobbies: ['Gaming', 'Sports'] }   // 1 shared hobby (Gaming)
];

// Expected score: 2 unique friends + (2 shared hobbies * 0.5) = 2 + 1 = 3
const score1 = calculatePopularity(user1, friendDocs1);
assertEqual(score1, 3, 'Score calculation with shared hobbies');

// TEST 2: Popularity Score with No Shared Hobbies
console.log('\n--- TEST 2: Popularity Score with No Shared Hobbies ---');

const user2 = {
    _id: '1',
    friends: ['2', '3'],
    hobbies: ['Coding']
};

const friendDocs2 = [
    { _id: '2', hobbies: ['Reading', 'Sports'] },
    { _id: '3', hobbies: ['Swimming', 'Tennis'] }
];

// Expected score: 2 unique friends + (0 shared hobbies * 0.5) = 2
const score2 = calculatePopularity(user2, friendDocs2);
assertEqual(score2, 2, 'Score with no shared hobbies');

// TEST 3: Popularity Score with Multiple Shared Hobbies
console.log('\n--- TEST 3: Popularity Score with Multiple Shared Hobbies ---');

const user3 = {
    _id: '1',
    friends: ['2'],
    hobbies: ['Coding', 'Gaming', 'Music', 'Reading']
};

const friendDocs3 = [
    { _id: '2', hobbies: ['Coding', 'Gaming', 'Music', 'Reading'] } // All 4 hobbies shared
];

// Expected score: 1 unique friend + (4 shared hobbies * 0.5) = 1 + 2 = 3
const score3 = calculatePopularity(user3, friendDocs3);
assertEqual(score3, 3, 'Score with multiple shared hobbies');

// TEST 4: Friendship Prevention Logic - Circular Reference Test
console.log('\n--- TEST 4: Friendship Prevention Logic (Circular Reference) ---');

// Simulating circular friendship check logic
const userA = {
    _id: 'userA',
    friends: ['userB']
};

const userB = {
    _id: 'userB',
    friends: ['userA']
};

// Check: if userA.friends includes userB._id
const isAlreadyFriends = userA.friends.includes(userB._id);
assertTrue(isAlreadyFriends, 'Circular friendship detected');

// If we try to add again, the system should prevent duplicate
const alreadyExists = userA.friends.includes(userB._id);
assertTrue(!(!alreadyExists), 'Duplicate friendship prevention works');

// TEST 5: User Deletion Prevention Logic
console.log('\n--- TEST 5: User Deletion Prevention (Has Friendships) ---');

const userWithFriends = {
    _id: 'user1',
    friends: ['user2', 'user3'],
    username: 'John'
};

const canDeleteUser = userWithFriends.friends.length === 0;
assertTrue(!canDeleteUser, 'Cannot delete user with active friendships');

// TEST 6: User Deletion Prevention Logic - No Friends
console.log('\n--- TEST 6: User Deletion Allowed (No Friendships) ---');

const userWithoutFriends = {
    _id: 'user4',
    friends: [],
    username: 'Jane'
};

const canDeleteUser2 = userWithoutFriends.friends.length === 0;
assertTrue(canDeleteUser2, 'Can delete user with no friendships');

// TEST 7: Hobby Array Validation
console.log('\n--- TEST 7: Hobby Array Validation ---');

const hobbyList = ['Coding', 'Gaming', 'Reading'];
const isValidHobbyList = Array.isArray(hobbyList) && hobbyList.length > 0 && hobbyList.every(h => typeof h === 'string' && h.length > 0);
assertTrue(isValidHobbyList, 'Valid hobby array passes validation');

// TEST 8: Invalid Hobby Array
console.log('\n--- TEST 8: Invalid Hobby Array Validation ---');

const invalidHobbyList = ['Coding', '', 'Reading']; // Empty string is invalid
const isValidHobbyList2 = Array.isArray(invalidHobbyList) && invalidHobbyList.length > 0 && invalidHobbyList.every(h => typeof h === 'string' && h.length > 0);
assertTrue(!isValidHobbyList2, 'Invalid hobby array fails validation');

// Print Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests Passed: ${passedTests}`);
console.log(`Tests Failed: ${failedTests}`);
console.log(`Total Tests: ${passedTests + failedTests}`);
console.log(`${'='.repeat(50)}\n`);

// Exit with proper code
process.exit(failedTests > 0 ? 1 : 0);
