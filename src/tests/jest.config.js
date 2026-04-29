module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'js'],
    collectCoverageFrom: ['../**/*.ts', '!../**/*.spec.ts', '!../node_modules/**'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/../$1',
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    types: ['jest', 'node'],
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    isolatedModules: true,
                },
            },
        ],
    },
}
