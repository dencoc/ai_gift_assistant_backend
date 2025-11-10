import pool from '../lib/db'
import {
    UserRequest,
    UserResponse,
    UserResponseWithPassword,
    UserRequestWithPassword,
} from '../types/user'
import bcrypt from 'bcrypt'

export class UserModel {
    static async createUser(user: UserRequestWithPassword): Promise<UserResponse> {
        await pool.query('ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(250);')
        const { rows } = await pool.query(
            `INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id, email, username, created_at;`,
            [user.email, user.username, user.password],
        )

        return rows[0]
    }

    static async getUserById(id: number): Promise<UserResponse | null> {
        const { rows } = await pool.query(
            `SELECT u.*, p.name AS avatar_filename,
            CASE WHEN p.name IS NOT NULL 
                 THEN $2 || '/api/avatar/url/' || p.name 
                 ELSE NULL 
            END AS avatar
     FROM users u
     LEFT JOIN photo p ON u.id = p.user_id
     WHERE u.id = $1`,
            [id, process.env.SERVER_URL],
        )
        return rows[0] || null
    }

    static async getUserByEmail(email: string): Promise<UserResponse | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        return rows[0] || null
    }

    static async getUserByEmailWithPassword(
        email: string,
    ): Promise<UserResponseWithPassword | null> {
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

    static async getUserByTelegramLink(telegramLink: string): Promise<UserResponse | null> {
        const { rows } = await pool.query(
            "SELECT email, telegram_chat_id, telegram_link_confirmed FROM users WHERE REPLACE(telegram_link, 'https://t.me/', '') = $1",
            [telegramLink],
        )

        return rows[0] || null
    }

    static async searchUser(username: string, email: string): Promise<UserResponse[] | null> {
        let query = 'SELECT * FROM users left join photo on users.id = photo.user_id WHERE'
        const params: string[] = []
        const values: any[] = []

        if (username) {
            params.push(`username ILIKE $${params.length + 1}`)
            values.push(`%${username}%`)
        }

        if (email) {
            params.push(`email ILIKE $${params.length + 1}`)
            values.push(`%${email}%`)
        }

        if (params.length === 0) {
            return null
        }

        query += ' ' + params.join(' OR ')

        const { rows } = await pool.query(query, values)

        return rows.length ? rows : null
    }

    static async updateUser(user: UserRequest): Promise<UserResponse> {
        const { rows } = await pool.query(
            'UPDATE users SET email = $1, username = $2, birthdate = $3, gender = $5, description = $6, telegram_link = $7, name = $8, surname = $9, telegram_init_id = $7 WHERE id = $4 RETURNING *',
            [
                user.email,
                user.username,
                user.birthdate,
                user.id,
                user.gender,
                user.description,
                user.telegram_link,
                user.name,
                user.surname,
            ],
        )
        return rows[0]
    }

    static async updateUserPassword(email: string, password: string): Promise<UserResponse> {
        const { rows } = await pool.query(
            'UPDATE users SET password = $2 WHERE email = $1 RETURNING *',
            [email, password],
        )
        return rows[0]
    }

    static async verifyEmail(id: number): Promise<boolean> {
        await pool.query('UPDATE users SET email_confirmed = true WHERE id = $1', [id])
        return true
    }

    static async verifyTelegramLink(
        id: number,
        telegramLink: string,
        telegramChatId: number,
    ): Promise<boolean> {
        await pool.query(
            'UPDATE users SET telegram_link_confirmed = true, telegram_chat_id = $2 WHERE id = $1 AND telegram_link = $3',
            [id, telegramChatId, telegramLink],
        )
        return true
    }

    static async deleteUser(id: number): Promise<boolean> {
        await pool.query('DELETE FROM users WHERE id = $1', [id])
        return true
    }

    static async updatePasswordByTelegramChatId(
        chatId: number,
        newPassword: string,
    ): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        try {
            await pool.query('UPDATE users SET password = $1 WHERE telegram_chat_id = $2', [
                hashedPassword,
                chatId,
            ])
        } catch (error) {
            console.error('Error updating password:', error)
            throw error
        }
    }

    static async getUserByTelegramChatId(chatId: number) {
        try {
            const { rows } = await pool.query('SELECT * FROM users WHERE telegram_chat_id = $1', [
                chatId,
            ])
            return rows[0] || null
        } catch (error) {
            console.error('Error fetching user by chatId:', error)
            throw error
        }
    }
}
