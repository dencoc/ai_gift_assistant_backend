import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createTokenPair, verifyRefreshToken, saveRefreshToken } from '../utils/tokens'
import { sendResponse } from '../utils/SendResponse'

export class TokenController {
    static async updateRefreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.refreshToken
            if (refreshToken.length === 0) {
                return sendResponse(res, null, 'Токен обновления не найден', false, 401)
            }

            const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
                id: number
            }

            await verifyRefreshToken(refreshToken, user.id)

            const newTokens = createTokenPair(user.id)

            await saveRefreshToken(user.id, newTokens.refreshToken)

            res.cookie('refreshToken', newTokens.refreshToken, { httpOnly: true, secure: false })
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
