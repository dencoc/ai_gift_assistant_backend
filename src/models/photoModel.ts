import pool from '../lib/db'

export class PhotoModel {
    static async saveAvatar(userId: number, filename: string): Promise<void> {
        await pool.query(
            `INSERT INTO photo (user_id, name) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET name = $2`,
            [userId, filename],
        )
    }

    static async getAvatarFilename(userId: number): Promise<string | null> {
        const { rows } = await pool.query('SELECT name FROM photo WHERE user_id = $1', [userId])
        return rows[0]?.name || null
    }
}
