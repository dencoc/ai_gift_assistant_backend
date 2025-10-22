import { ZodSchema, ZodError } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

export const validateSchema = (schema: ZodSchema<any>) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body)
            next()
        } catch (err) {
            if (err instanceof ZodError) {
                const messages = err.issues.map(
                    (issue) => `${issue.path.join('.')}: ${issue.message}`,
                )
                return next(new AppError(messages.join('; '), 400))
            }
            next(err)
        }
    }
}
