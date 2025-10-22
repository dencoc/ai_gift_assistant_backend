import crypto from 'crypto'
import { redisClient } from '../lib/redisClient'

const TOKEN_EXPIRATION = 60 * 60

export async function createEmailToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')
    await redisClient.setEx(`email_token:${token}`, TOKEN_EXPIRATION, String(userId))
    return token
}

export async function verifyEmailToken(token: string): Promise<number | null> {
    const key = `email_token:${token}`
    const userId = await redisClient.get(key)
    if (!userId) return null

    await redisClient.del(key)
    return Number(userId)
}
