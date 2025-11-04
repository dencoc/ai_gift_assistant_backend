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
        onChunk: (chunk: string) => void,
    ): Promise<void> {
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
                prompt: userMessage,
                sender_id: String(sender_id),
                recipient_id: String(recipient_id),
            }),
        })

        console.log(response)
        console.log('AI Response headers:', Object.fromEntries(response.headers))
        console.log('Content-Type:', response.headers.get('content-type'))

        if (!response.headers.get('content-type')?.includes('text/plain')) {
            const text = await response.text()
            console.warn('Not streaming, got JSON:', text)
            onChunk(text)
            return
        }
        // services/messageService.ts
        if (!response.ok) {
            let errorText = 'Unknown error'
            try {
                const errorBody = await response.text()
                console.error('AI agent error body:', errorBody)
                errorText = errorBody
            } catch {
                // Игнор
            }
            throw new AppError(`AI agent error: ${response.status} — ${errorText}`, 502)
        }
        if (!response.body) throw new AppError('No response body from AI agent', 500)

        const reader = response.body.getReader()
        console.log(reader)
        const decoder = new TextDecoder()
        let assistantReply = ''

        try {
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                console.log('asl;jkdlkajs' + chunk)
                assistantReply += chunk
                onChunk(chunk)
            }
        } finally {
            reader.releaseLock()
        }

        await MessageModel.createMessage({
            text: assistantReply,
            chat_id: chatId,
            role: 'assistant',
        })
    }

    static async getMessagesByChatId(chatId: number): Promise<MessageResponse[]> {
        if (!chatId) throw new AppError('Chat id is required', 400)
        return MessageModel.getMessagesByChatId(chatId)
    }
}
