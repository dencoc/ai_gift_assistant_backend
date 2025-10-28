import { v4 as uuidv4 } from 'uuid'
import { TelegramModel } from '../models/telegramModel'

export class TelegramService {
    static async generateDeepLink(userId: number, botUsername: string): Promise<string> {
        const token = uuidv4()
        await TelegramModel.setBindToken(userId, token)
        const cleanBotUsername = botUsername.startsWith('@') ? botUsername.slice(1) : botUsername
        const deepLink = `https://t.me/${cleanBotUsername}?start=${token}`

        return deepLink
    }

    static async processDeepLink(
        token: string,
        chatId: number,
        telegramUsername?: string,
    ): Promise<boolean> {
        const user = await TelegramModel.getUserByBindToken(token)
        if (!user) {
            return false
        }

        if (telegramUsername && user.telegram_init_id) {
            const isUsernameMatch = await TelegramModel.checkUsernameMatch(
                user.id,
                telegramUsername,
            )
            if (!isUsernameMatch) {
                return false
            }
        }

        return true
    }
}
