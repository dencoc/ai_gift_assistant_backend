import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types/token'
import { RequestWithUser } from '../types/request'
import { sendResponse } from '../utils/SendResponse'

export const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(res, null, 'Unauthorized', false, 401)
    }
    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JWTPayload

        req.user = { email: decoded.email }
        next()
    } catch (error) {
        console.log(error)
        return sendResponse(res, null, 'Unauthorized', false, 401)
    }
}
