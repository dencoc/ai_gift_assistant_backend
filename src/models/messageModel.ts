import pool from '../lib/db'
import { MessageRequest, MessageResponse } from '../types/message'

export class MessageModel {
    static async createMessage(message: MessageRequest): Promise<MessageResponse> {
        const { rows } = await pool.query(
            `
            INSERT INTO messages (text, chat_id, role, timestamp)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `,
            [message.text, message.chat_id, message.role],
        )
        return rows[0]
    }

    static async getMessagesByChatId(chatId: number): Promise<MessageResponse[]> {
        const { rows } = await pool.query('SELECT * FROM messages WHERE chat_id = $1', [chatId])
        return rows
    }
}
