// services/messageService.ts
import { MessageModel } from '../models/messageModel'
import { ChatModel } from '../models/chatModel'
import { AppError } from '../utils/AppError'
import { MessageRequest, MessageResponse } from '../types/message'

const AI_AGENT_URL = process.env.AI_CHAT_AGENT_HOST

export class MessageService {
    static async streamMessage(
        chatId: number,
        userMessage: string,
        sender_id: number,
        recipient_id: number,
    ): Promise<string> {
        // ← Возвращаем строку, а не вызываем onChunk
        const chat = await ChatModel.getChatById(chatId)
        if (!chat) throw new AppError('Chat not found', 404)

        await MessageModel.createMessage({
            text: userMessage,
            chat_id: chatId,
            role: 'user',
        })

        console.log({ sender_id, recipient_id, prompt: userMessage })

        const response = await fetch(`${AI_AGENT_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                sender_id: String(sender_id),
                recipient_id: recipient_id ? String(recipient_id) : String(sender_id),
            }),
        })

        console.log('AI Response:', response)

        if (!response.ok) {
            let errorText = 'Unknown error'
            try {
                const errorBody = await response.text()
                console.error('AI agent error body:', errorBody)
                errorText = errorBody
            } catch {}
            throw new AppError(`AI agent error: ${response.status} — ${errorText}`, 502)
        }

        const responseBody: any = await response.json()
        console.log('AI JSON response:', responseBody)

        let assistantReply = ''

        if (responseBody && responseBody.answer) {
            assistantReply = responseBody.answer.response
        } else {
            assistantReply = JSON.stringify(responseBody.response)
        }

        await MessageModel.createMessage({
            text: assistantReply,
            chat_id: chatId,
            role: 'assistant',
        })

        return assistantReply
    }

    static async getMessagesByChatId(chatId: number): Promise<MessageResponse[]> {
        if (!chatId) throw new AppError('Chat id is required', 400)
        return MessageModel.getMessagesByChatId(chatId)
    }
}
