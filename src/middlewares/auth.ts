import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types/token'
import { RequestWithUser } from '../types/request'

export const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload

        req.user = { id: decoded.id }
        next()
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' })
    }
}
