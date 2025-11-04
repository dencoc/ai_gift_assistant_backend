import { ChatResponse, ChatRequest } from '../types/chat'
import { ChatModel } from '../models/chatModel'
import { AppError } from '../utils/AppError'
import { UserService } from './userService'

export class ChatService {
    static async createChat(chat: ChatRequest): Promise<ChatResponse> {
        if (!chat.sender_id) throw new AppError('Sender id is required', 400)
        await UserService.getUserById(chat.sender_id)
        if (!chat.title) throw new AppError('Title is required', 400)
        if (!chat.context) throw new AppError('Context is required', 400)
        const createdChat = await ChatModel.createChat(chat)
        if (!createdChat) throw new AppError('Chat not created', 500)
        return createdChat
    }

    static async updateChat(chat: ChatRequest): Promise<ChatResponse> {
        if (!chat.id) throw new AppError('Chat id is required', 400)
        if (!chat.sender_id) throw new AppError('Sender id is required', 400)
        await UserService.getUserById(chat.sender_id)
        if (!chat.title) throw new AppError('Title is required', 400)
        if (!chat.context) throw new AppError('Context is required', 400)
        const updatedChat = await ChatModel.updateChat(chat)
        if (!updatedChat) throw new AppError('Chat not updated', 500)
        return updatedChat
    }

    static async getChatById(id: number): Promise<ChatResponse | null> {
        if (!id) throw new AppError('Chat id is required', 400)
        const chat = await ChatModel.getChatById(id)
        if (!chat) throw new AppError('Chat not found', 404)
        return chat
    }

    static async getAllChatsByUserId(userId: number): Promise<ChatResponse[]> {
        if (!userId) throw new AppError('User id is required', 400)
        await UserService.getUserById(userId)
        const chats = await ChatModel.getAllChatsByUserId(userId)
        return chats
    }

    static async addRecipientToChat(chatId: number, recipientId: number): Promise<ChatResponse> {
        if (!chatId) throw new AppError('Chat id is required', 400)
        if (!recipientId) throw new AppError('Recipient id is required', 400)
        await UserService.getUserById(recipientId)
        const chat = await ChatModel.addRecipientToChat(chatId, recipientId)
        if (!chat) throw new AppError('Chat not updated', 500)
        return chat
    }

    static async deleteChat(chatId: number): Promise<void> {
        if (!chatId) throw new AppError('Chat id is required', 400)
        await ChatModel.deleteChat(chatId)
    }
}
