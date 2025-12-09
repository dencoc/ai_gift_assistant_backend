// jest.setup.ts
import pool from '../lib/db'

// Очищаем БД перед каждым тестом
beforeAll(async () => {
    await pool.query('TRUNCATE users, photo RESTART IDENTITY CASCADE')
})

afterAll(async () => {
    await pool.end()
})
