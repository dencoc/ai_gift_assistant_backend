import cron from 'node-cron'
import pool from '../lib/db'

async function deleteUnconfirmedUsers() {
    try {
        const result = await pool.query(`
      DELETE FROM users
      WHERE email_confirmed = false
        AND created_at < NOW() - INTERVAL '0.25 hour';
    `)
        console.log(`Удалено пользователей: ${result.rowCount}`)
    } catch (err) {
        console.error('Ошибка при удалении:', err)
    }
}

cron.schedule('*/10 * * * *', () => {
    console.log('Запуск очистки неподтверждённых пользователей...')
    deleteUnconfirmedUsers()
})
