import jwt from 'jsonwebtoken'
import { redisClient } from '../lib/redisClient'
import { AppError } from './AppError'
import { TokenPair } from '../types/token'

export function createAccessToken(email: string): string {
    const accessToken = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '15m',
    })

    return accessToken
}

export function createRefreshToken(email: string): string {
    const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
    })

    return refreshToken
}

export function createTokenPair(id: number): TokenPair {
    const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET!, {
        expiresIn: '15m',
    })

    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
    })

    return { accessToken, refreshToken }
}

export async function saveRefreshToken(id: number, refreshToken: string): Promise<void> {
    try {
        await redisClient.setEx(`user_id:${id}`, 60 * 60 * 24 * 7, refreshToken)
    } catch (error) {
        throw new AppError('Error saving refresh token', 500)
    }
}

export async function verifyRefreshToken(refreshToken: string, id: number): Promise<void> {
    try {
        const storedToken = await redisClient.get(`user_id:${id}`)

        if (storedToken && storedToken === refreshToken) {
            return
        } else {
            throw new AppError('Invalid refresh token', 401)
        }
    } catch (error) {
        throw new AppError('Error verifying refresh token', 500)
    }
}

export async function deleteRefreshToken(id: number): Promise<void> {
    try {
        await redisClient.del(`user_id:${id}`)
    } catch (error) {
        throw new AppError('Error deleting refresh token', 500)
    }
}
