import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { sendResponse } from '../utils/SendResponse'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AppError) {
        return sendResponse(res, null, err.message, false, err.statusCode)
    }

    console.error('Unhandled error:', err)
    return res.status(500).json({ message: 'Internal server error' })
}
