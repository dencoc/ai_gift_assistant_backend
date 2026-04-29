import { createClient } from 'redis'

export const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
})

redisClient.on('error', (err) => console.error('❌ Redis error:', err))
redisClient.on('connect', () => console.log('✅ Redis connected'))

redisClient.connect()
