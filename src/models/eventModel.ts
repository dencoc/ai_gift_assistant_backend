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
        date?: string, // опциональный фильтр на конкретную дату
    ): Promise<EventResponse[]> {
        const values: any[] = [userId]
        let dateFilter = ''

        if (date) {
            dateFilter = `WHERE gs.day = DATE($2)`
            values.push(date)
        }

        const query = `
        WITH date_series AS (
            SELECT generate_series(
                CURRENT_DATE, 
                CURRENT_DATE + INTERVAL '365 days', -- или до MAX(e.date), если нужно
                INTERVAL '1 day'
            )::date AS day
        ),
        paginated_dates AS (
            SELECT day
            FROM date_series gs
            ${dateFilter}
            ORDER BY day ASC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        )
       SELECT 
    pd.day AS date,
    e.id,
    e.title,
    e.description,
    e.importance_id,
    e.completed,
    e.user_id,
    e.recipient_id,
    u.id AS "userId",
    u.username AS "userName",
    u.email AS "userEmail"
FROM paginated_dates pd
LEFT JOIN events e
    ON e.user_id = $1 AND e.date = pd.day
LEFT JOIN users u
    ON e.recipient_id = u.id
ORDER BY pd.day ASC, e.id ASC
    `

        values.push(limit, offset)

        const { rows } = await pool.query<EventResponse>(query, values)
        return rows
    }

    static async getEventById(id: number): Promise<EventResponse | null> {
        const { rows } = await pool.query<EventResponse>(
            `
        SELECT 
            e.id,
            e.title,
            e.description,
            TO_CHAR(e.date, 'YYYY-MM-DD') AS date,
            e.importance_id,
            e.completed,
            e.recipient_id,
            e.user_id
        FROM events e
        WHERE e.id = $1
        `,
            [id],
        )

        return rows[0] || null
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
