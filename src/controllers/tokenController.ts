import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createTokenPair, verifyRefreshToken, saveRefreshToken } from '../utils/tokenUtils'
import { sendResponse } from '../utils/SendResponse'
import { JWTPayload } from '../types/token'

export class TokenController {
    static async updateRefreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken
            console.log(refreshToken)
            if (refreshToken.length === 0) {
                return sendResponse(res, null, 'Токен обновления не найден', false, 401)
            }

            const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JWTPayload
            console.log(user)
            if (!user.id) {
                return sendResponse(res, null, 'Токен обновления не найден', false, 401)
            }

            await verifyRefreshToken(refreshToken, user.id)

            const newTokens = createTokenPair(user.id)
            console.log(newTokens)

            await saveRefreshToken(user.id, newTokens.refreshToken)

            res.cookie('refreshToken', newTokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            })
            return sendResponse(
                res,
                { accessToken: newTokens.accessToken },
                'Токен обновлен',
                true,
                200,
            )
        } catch (error: any) {
            next({ status: 400, message: `Ошибка при обновлении токена доступа: ${error.message}` })
        }
    }
}
