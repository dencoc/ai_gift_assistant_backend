import { Request, Response, NextFunction } from 'express'
import { ChatService } from '../services/chatService'
import { sendResponse } from '../utils/SendResponse'
import { RequestWithUser } from '../types/request'

export class ChatController {
    static async createChat(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const chat = await ChatService.createChat({
                ...req.body,
                sender_id: req.user?.id as number,
            })
            return sendResponse(res, chat, 'Chat created successfully', true, 201)
        } catch (error) {
            next(error)
        }
    }

    static async getChatById(req: Request, res: Response, next: NextFunction) {
        try {
            const chat = await ChatService.getChatById(Number(req.params.id))
            return sendResponse(res, chat, 'Chat found successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async getAllChatsByUserId(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const chats = await ChatService.getAllChatsByUserId(req.user?.id as number)
            return sendResponse(res, chats, 'Chats found successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async updateChat(req: Request, res: Response, next: NextFunction) {
        try {
            const chat = await ChatService.updateChat(req.body)
            return sendResponse(res, chat, 'Chat updated successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async addRecipientToChat(req: Request, res: Response, next: NextFunction) {
        try {
            const chat = await ChatService.addRecipientToChat(
                Number(req.params.id),
                Number(req.body.recipient_id),
            )

            return sendResponse(res, chat, 'Chat updated successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async deleteChat(req: Request, res: Response, next: NextFunction) {
        try {
            const chat = await ChatService.deleteChat(Number(req.params.id))
            return sendResponse(res, chat, 'Chat deleted successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }
}
