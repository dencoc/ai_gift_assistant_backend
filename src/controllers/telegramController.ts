import { Request, Response, NextFunction } from 'express'
import { TelegramService } from '../services/telegramService'
import { sendResponse } from '../utils/SendResponse'

export class TelegramController {
    static async createLink(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body
            const link = await TelegramService.generateDeepLink(userId, process.env.BOT_USERNAME!)
            return sendResponse(res, { link }, 'Telegram link created successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }
}
