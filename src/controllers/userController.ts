import { UserService } from '../services/userService'
import { Request, Response, NextFunction } from 'express'
import { sendResponse } from '../utils/SendResponse'
import { verifyEmailToken } from '../utils/verificationStore'
import { createAccessToken } from '../utils/tokens'
import { sendVerificationEmail } from '../utils/emailUtils'

export class UserController {
    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            await UserService.searchUser(req.body.username, req.body.email)
            const emailToken = createAccessToken(req.body.email)
            await sendVerificationEmail(req.body.email, emailToken)

            const user = await UserService.createUser(req.body)
            return sendResponse(res, user, 'User created successfully', true, 201)
        } catch (error) {
            next(error)
        }
    }

    static async confirmEmail(req: Request, res: Response) {
        const token = req.query.token as string
        if (!token) return sendResponse(res, null, 'Token is required', false, 400)

        const email = await verifyEmailToken(token)
        if (!email) return sendResponse(res, null, 'Invalid or expired token', false, 400)

        await UserService.verifyEmail(email)
        return sendResponse(res, null, 'Email confirmed successfully', true, 200)
    }
}
