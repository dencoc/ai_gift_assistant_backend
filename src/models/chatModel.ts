import pool from '../lib/db'
import { ChatRequest, ChatResponse } from '../types/chat'

export class ChatModel {
    static async createChat(chat: ChatRequest): Promise<ChatResponse> {
        const { rows } = await pool.query(
            'INSERT INTO chats (sender_id, title, context) VALUES ($1, $2, $3) RETURNING *',
            [chat.sender_id, chat.title, chat.context],
        )
        return rows[0]
    }

    static async getChatById(id: number): Promise<ChatResponse | null> {
        const { rows } = await pool.query('SELECT * FROM chats WHERE id = $1', [id])
        return rows[0] || null
    }

    static async getAllChatsByUserId(userId: number): Promise<ChatResponse[]> {
        const { rows } = await pool.query('SELECT * FROM chats WHERE sender_id = $1', [userId])
        return rows
    }

    static async addRecipientToChat(chatId: number, recipientId: number): Promise<ChatResponse> {
        const { rows } = await pool.query(
            'UPDATE chats SET recipient_id = $2 WHERE id = $1 RETURNING *',
            [chatId, recipientId],
        )
        return rows[0]
    }

    static async updateChat(chat: ChatRequest): Promise<ChatResponse> {
        const { rows } = await pool.query(
            'UPDATE chats SET title = $2, context = $3 WHERE id = $1 RETURNING *',
            [chat.id, chat.title, chat.context],
        )
        return rows[0]
    }

    static async deleteChat(chatId: number): Promise<void> {
        await pool.query('DELETE FROM chats WHERE id = $1', [chatId])
    }
}
