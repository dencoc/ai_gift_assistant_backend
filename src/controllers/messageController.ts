// controllers/MessageController.ts
import { Request, Response, NextFunction } from 'express'
import { MessageService } from '../services/messageService'
import { AppError } from '../utils/AppError'
import { RequestWithUser } from '../types/request'

export class MessageController {
    static async stream(req: RequestWithUser, res: Response, next: NextFunction) {
        const { chatId, message, recipient_id } = req.body

        if (!chatId || !message) {
            return res.status(400).json({ error: 'chatId and message are required' })
        }

        try {
            const fullResponse = await MessageService.streamMessage(
                chatId,
                message,
                req.user?.id as number,
                recipient_id,
            )

            // Просто возвращаем JSON
            res.json({
                success: true,
                answer: fullResponse,
            })
        } catch (error: any) {
            console.error('Stream error:', error)
            res.status(502).json({
                success: false,
                error: error.message || 'AI agent failed',
            })
        }
    }

    static async getMessagesByChatId(req: Request, res: Response, next: NextFunction) {
        try {
            const messages = await MessageService.getMessagesByChatId(Number(req.params.id))
            res.json({
                success: true,
                message: 'Messages found successfully',
                data: messages,
            })
        } catch (error) {
            next(error)
        }
    }
}
