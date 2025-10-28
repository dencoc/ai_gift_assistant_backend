import pool from '../lib/db'

export class TelegramModel {
    static async setBindToken(userId: number, token: string): Promise<void> {
        try {
            await pool.query('UPDATE users SET telegram_link = $1 WHERE id = $2', [token, userId])
        } catch (error) {
            throw error
        }
    }

    static async getUserByBindToken(token: string) {
        try {
            const { rows } = await pool.query('SELECT * FROM users WHERE telegram_link = $1', [
                token,
            ])
            return rows[0] || null
        } catch (error) {
            console.error('Error getting user by token:', error)
            throw error
        }
    }

    static async confirmTelegramLink(userId: number, chatId: number): Promise<void> {
        try {
            await pool.query(
                `
                UPDATE users
                SET telegram_chat_id = $1,
                    telegram_link_confirmed = TRUE,
                    telegram_link = NULL
                WHERE id = $2
            `,
                [chatId, userId],
            )
        } catch (error) {
            throw error
        }
    }

    static async saveChatIdAndUsername(
        userId: number,
        chatId: number,
        username: string,
    ): Promise<void> {
        try {
            await pool.query(
                `
                UPDATE users
                SET telegram_chat_id = $1,
                    telegram_username = $2
                WHERE id = $3
            `,
                [chatId, username, userId],
            )
        } catch (error) {
            throw error
        }
    }

    static async checkUsernameMatch(userId: number, telegramUsername: string): Promise<boolean> {
        try {
            const { rows } = await pool.query('SELECT telegram_init_id FROM users WHERE id = $1', [
                userId,
            ])

            if (!rows[0]) {
                return false
            }
            const expectedUsername = rows[0].telegram_init_id.slice(1)
            const isMatch = expectedUsername?.toLowerCase() === telegramUsername.toLowerCase()

            return isMatch
        } catch (error) {
            throw error
        }
    }
}
