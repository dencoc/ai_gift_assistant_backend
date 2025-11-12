import { UserService } from '../services/userService'
import { Request, Response, NextFunction } from 'express'
import { sendResponse } from '../utils/SendResponse'
import {
    createAccessToken,
    createTokenPair,
    saveRefreshToken,
    deleteRefreshToken,
} from '../utils/tokenUtils'
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/emailUtils'
import { RequestWithUser } from '../types/request'
import { TelegramService } from '../services/telegramService'
import { sanitizeUser } from '../utils/sanitizeUser'
import { UserResponse } from '../types/user'

export class UserController {
    static async getMe(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const user = await UserService.getUserById(req.user?.id as number)
            return sendResponse(res, sanitizeUser(user), 'User found successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async searchUser(req: Request, res: Response, next: NextFunction) {
        try {
            const username = typeof req.query.username === 'string' ? req.query.username : ''
            const email = typeof req.query.email === 'string' ? req.query.email : ''
           
            const users = await UserService.searchUser(username, email)
            const result = (users ?? [])
                .map(sanitizeUser)
                .filter((u): u is UserResponse => u !== null)
                
            return sendResponse(res, result, 'User found successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async getUserById(req: RequestWithUser, res: Response, next: NextFunction) {
        console.log(1)
        try {
            const id = req.params.id
            const user = await UserService.getUserById(Number(id))
            return sendResponse(res, sanitizeUser(user), 'User found successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async sendResetEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.body.email
            const emailToken = createAccessToken(email)
            await sendResetPasswordEmail(email, emailToken)
            return sendResponse(res, null, 'Email sent successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            await UserService.searchUser(req.body.username, req.body.email)
            const emailToken = createAccessToken(req.body.email)
            await sendVerificationEmail(req.body.email, emailToken)
            const user = await UserService.createUser(req.body)
            return sendResponse(res, sanitizeUser(user), 'User created successfully', true, 201)
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

            const tokens = createTokenPair(user.id)
            await saveRefreshToken(user.id, tokens.refreshToken)
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            })

            return sendResponse(
                res,
                { isVerified, accessToken: tokens.accessToken },
                'Email verified successfully',
                true,
                200,
            )
        } catch (error) {
            next(error)
        }
    }

    static async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.loginUser(req.body)

            const { accessToken, refreshToken } = createTokenPair(user.id)

            console.log(`user_id:${user.id} - ${refreshToken}`)
            await saveRefreshToken(user.id, refreshToken)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            })

            const userWithToken = { ...sanitizeUser(user), accessToken }
            return sendResponse(res, userWithToken, 'User logged in successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async updateUser(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const { telegram_link } = req.body

            if (telegram_link && !/^@[A-Za-z0-9_]{5,}$/.test(telegram_link)) {
                throw new Error(
                    'Invalid Telegram username format. Must start with @ and be at least 5 characters long.',
                )
            }
            const userData = {
                ...req.body,
                id: req.user?.id,
            }
            const user = await UserService.updateUser(userData)
            let deepLink = null

            if (user.telegram_link && !user.telegram_link_confirmed && user.id) {
                deepLink = await TelegramService.generateDeepLink(
                    user.id,
                    process.env.BOT_USERNAME!,
                )
            }

            return sendResponse(
                res,
                { user: sanitizeUser(user), deepLink },
                'User updated successfully. Please follow the Telegram link to confirm.',
                true,
                200,
            )
        } catch (error) {
            next(error)
        }
    }

    static async updatePassword(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            await UserService.updateUserPassword(req.user?.email as string, req.body.password)
            return sendResponse(res, null, 'Password updated successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async logout(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            await deleteRefreshToken(req.user?.id as number)
            res.clearCookie('refreshToken')

            return sendResponse(res, null, 'User logged out successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async deleteUser(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            await UserService.deleteUser(req.user?.id as number)
            res.clearCookie('refreshToken')
            await deleteRefreshToken(req.user?.id as number)
            return sendResponse(res, null, 'User deleted successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }
}
