import pool from '../lib/db'
import {
    UserRequest,
    UserResponse,
    UserResponseWithPassword,
    UserRequestWithPassword,
} from '../types/user'

export class UserModel {
    static async createUser(user: UserRequestWithPassword): Promise<UserResponse> {
        const { rows } = await pool.query('INSERT INTO users (email, username, password', [
            user.email,
            user.username,
            user.password,
        ])

        return rows[0]
    }

    static async getUserById(id: number): Promise<UserResponse | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
        return rows[0] || null
    }

    static async getUserByEmail(email: string): Promise<UserResponse | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        return rows[0] || null
    }

    static async getUserByIdWithPassword(id: number): Promise<UserResponseWithPassword | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
        return rows[0] || null
    }

    static async getUserByUsername(username: string): Promise<UserResponse | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username])
        return rows[0] || null
    }

    static async getUserByUsernameWithPassword(
        username: string,
    ): Promise<UserResponseWithPassword | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username])
        return rows[0] || null
    }

    static async searchUser(username: string, email: string): Promise<UserResponse | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [
            username,
            email,
        ])
        return rows[0] || null
    }

    static async updateUser(user: UserRequest): Promise<UserResponse> {
        const { rows } = await pool.query(
            'UPDATE users SET email = $1, username = $2, password = $3, birthdate = $4, gender = $5, description = $6, telegram_link = $7, name = $8, surname = $9 WHERE id = $4 RETURNING *',
            [
                user.id,
                user.email,
                user.username,
                user.birthdate,
                user.gender,
                user.description,
                user.telegram_link,
                user.name,
                user.surname,
            ],
        )
        return rows[0]
    }

    static async verifyEmail(id: number): Promise<boolean> {
        await pool.query('UPDATE users SET email_confirmed = true WHERE id = $1', [id])
        return true
    }

    static async verifyTelegramLink(id: number): Promise<boolean> {
        await pool.query('UPDATE users SET telegram_link_confirmed = true WHERE id = $1', [id])
        return true
    }

    static async deleteUser(id: number): Promise<boolean> {
        await pool.query('DELETE FROM users WHERE id = $1', [id])
        return true
    }
}
