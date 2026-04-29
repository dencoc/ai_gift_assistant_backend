import { Request, Response, NextFunction } from 'express'
import { RequestWithUser } from '../../types/request'

export const mockAuthMiddleware = (req: RequestWithUser, _res: Response, next: NextFunction) => {
    req.user = { id: 1, email: 'test@example.com' }
    next()
}
