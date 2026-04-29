import { Response } from 'express'
import { ApiResponse } from '../types/api'

export function sendResponse<T>(
    res: Response,
    data?: T,
    message?: string,
    success = true,
    statusCode = 200,
) {
    const response: ApiResponse<T | null> = {
        success,
        statusCode,
        data: success ? data : undefined,
        message: success ? undefined : message,
    }
    return res.status(statusCode).json(response)
}
