import pool from '../lib/db'
import { EventRequest, EventResponse } from '../types/event'

export class EventModel {
    static async create(event: EventRequest): Promise<EventResponse> {
        const { rows } = await pool.query<EventResponse>(
            'INSERT INTO events (title, description, date, importance_id, recipient_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [
                event.title,
                event.description,
                event.date,
                event.importance_id,
                event.recipient_id,
                event.user_id,
            ],
        )
        return rows[0]
    }

    static async getEventsForUser(
        userId: number,
        limit: number,
        offset: number,
        date: string,
    ): Promise<EventResponse[]> {
        let query = 'SELECT * FROM events WHERE user_id = $1 LIMIT $2 OFFSET $3'
        const values: (number | string)[] = [userId, limit, offset]
        if (date) {
            query += ' AND date = $4'
            values.push(date)
        }
        const { rows } = await pool.query<EventResponse>(query, values)

        return rows
    }

    static async getEventById(id: number): Promise<EventResponse | null> {
        const { rows } = await pool.query<EventResponse>(
            `SELECT * FROM events LEFT JOIN users ON recipient_id = users.id WHERE id = $1`,
            [id],
        )
        return rows[0]
    }

    static async updateEvent(event: EventRequest): Promise<EventResponse> {
        const { rows } = await pool.query<EventResponse>(
            `UPDATE events SET title = $1, description = $2, date = $3, importance_id = $4, 
            recipient_id = $5, completed = $6 WHERE id = $7 RETURNING *`,
            [
                event.title,
                event.description,
                event.date,
                event.importance_id,
                event.recipient_id,
                event.completed,
                event.id,
            ],
        )
        return rows[0]
    }

    static async deleteEvent(id: number): Promise<void> {
        await pool.query(`DELETE FROM events WHERE id = $1`, [id])
    }
}
