module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.ts'], // Match test files with .test.ts
    moduleFileExtensions: ['ts', 'js'], // Handle TypeScript and JavaScript files
    transform: {
        '^.+\\.ts$': 'ts-jest', // Use ts-jest to transform TypeScript files
    },
};