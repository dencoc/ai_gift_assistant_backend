// controllers/MessageController.ts
import { Request, Response, NextFunction } from 'express'
import { MessageService } from '../services/messageService'
import { AppError } from '../utils/AppError'

export class MessageController {
    static async stream(req: Request, res: Response, next: NextFunction) {
        const { chatId, message, sender_id, recipient_id } = req.body

        if (!chatId || !message) {
            return res.status(400).json({ error: 'chatId and message are required' })
        }

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.flushHeaders()

        let isClientConnected = true

        req.on('close', () => {
            isClientConnected = false
            console.log('Client disconnected')
        })

        try {
            await MessageService.streamMessage(
                chatId,
                message,
                sender_id,
                recipient_id,
                (chunk: string) => {
                    if (isClientConnected && !res.writableEnded) {
                        res.write(`data: ${chunk}\n\n`)
                    }
                },
            )

            if (isClientConnected && !res.writableEnded) {
                res.write('data: [DONE]\n\n')
                res.end()
            }
        } catch (error: any) {
            if (isClientConnected && !res.writableEnded) {
                res.write(`data: [ERROR] ${error.message || 'Stream failed'}\n\n`)
                res.end()
            }
            console.error('Stream error:', error)
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
