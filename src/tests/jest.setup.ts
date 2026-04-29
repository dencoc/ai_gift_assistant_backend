// jest.setup.ts
/// <reference types="jest" />

jest.mock('../lib/db', () => ({
    default: {
        query: () => Promise.resolve({ rows: [] }),
        end: () => Promise.resolve(undefined),
    },
}))
