import { UserService } from '../services/userService'
import { Request, Response, NextFunction } from 'express'
import { sendResponse } from '../utils/SendResponse'
import { createAccessToken } from '../utils/tokens'
import { sendVerificationEmail } from '../utils/emailUtils'
import { RequestWithUser } from '../types/request'

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

    static async verifyEmail(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const email = req.user?.email as string
            const user = await UserService.getUserByEmail(email)
            if (!user) throw new Error('User not found')
            const isVerified = await UserService.verifyEmail(user.id)
            return sendResponse(res, isVerified, 'Email verified successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }
}
