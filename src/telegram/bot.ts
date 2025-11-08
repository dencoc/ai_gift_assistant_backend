import TelegramBot from 'node-telegram-bot-api'
import { TelegramService } from '../services/telegramService'
import { TelegramModel } from '../models/telegramModel'
import { UserModel } from '../models/userModel'
import { redisClient } from '../lib/redisClient'

const bot = new TelegramBot(process.env.TG_BOT_TOKEN!, { polling: true })
const RESET_STATE_KEY = (chatId: number) => `reset_password:state:${chatId}`
const RESET_TIMEOUT = 600

export function initTelegramBot() {
    console.log('Initializing Telegram bot with Redis state')

    bot.onText(/\/reset[-_]password/, async (msg) => {
        const chatId = msg.chat.id
        const user = await UserModel.getUserByTelegramChatId(chatId)

        if (!user) {
            await bot.sendMessage(chatId, 'Ошибка: Ваш Telegram не привязан к аккаунту.')
            return
        }

        await redisClient.setEx(
            RESET_STATE_KEY(chatId),
            RESET_TIMEOUT,
            JSON.stringify({ step: 'awaiting_confirmation' }),
        )

        await bot.sendMessage(chatId, 'Вы уверены, что хотите сбросить пароль?', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Подтвердить', callback_data: `reset_confirm_${chatId}` },
                        { text: 'Отменить', callback_data: `reset_cancel_${chatId}` },
                    ],
                ],
            },
        })
    })

    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id
        const data = callbackQuery.data
        const messageId = callbackQuery.message?.message_id

        if (!chatId || !data || !messageId) return

        const parts = data.split('_')
        const action = parts[0]
        const subAction = parts[1]
        const targetChatId = parts[2]

        if (chatId.toString() !== targetChatId) {
            await bot.answerCallbackQuery(callbackQuery.id, { text: 'Это не ваша кнопка!' })
            return
        }

        const stateKey = RESET_STATE_KEY(chatId)
        const stateData = await redisClient.get(stateKey)
        let state: { step: string } | null = null

        try {
            state = stateData ? JSON.parse(stateData) : null
        } catch (error) {
            console.error('Invalid JSON in Redis state:', stateData)
            await redisClient.del(stateKey)
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: 'Сессия повреждена. Начните заново.',
            })
            return
        }

        if (action === 'reset') {
            if (subAction === 'confirm') {
                if (!state || state.step !== 'awaiting_confirmation') {
                    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Сессия истекла.' })
                    return
                }

                await redisClient.setEx(
                    stateKey,
                    RESET_TIMEOUT,
                    JSON.stringify({ step: 'awaiting_new_password' }),
                )

                await bot.sendMessage(
                    chatId,
                    'Введите новый пароль (минимум 8 символов, без пробелов):',
                )
            }

            if (subAction === 'cancel') {
                await redisClient.del(stateKey)
                await bot.sendMessage(chatId, 'Сброс пароля отменён.')
            }

            try {
                await bot.editMessageReplyMarkup(
                    { inline_keyboard: [] },
                    { chat_id: chatId, message_id: messageId },
                )
            } catch (error: any) {
                if (!error.response?.body?.description?.includes('message is not modified')) {
                    console.error('Error removing keyboard:', error)
                }
            }
            await bot.answerCallbackQuery(callbackQuery.id)
            return
        }

        if (action === 'confirm') {
            const token = parts[1]
            const chatIdFromCallback = parts[2]

            if (chatId.toString() === chatIdFromCallback) {
                try {
                    const user = await TelegramModel.getUserByBindToken(token)
                    if (user) {
                        await TelegramModel.confirmTelegramLink(user.id, chatId)
                        await bot.sendMessage(chatId, 'Привязка Telegram подтверждена!')
                    } else {
                        await bot.sendMessage(chatId, 'Ошибка: токен не найден.')
                    }
                } catch (error) {
                    await bot.sendMessage(chatId, 'Ошибка при подтверждении.')
                }
            }

            try {
                await bot.editMessageReplyMarkup(
                    { inline_keyboard: [] },
                    { chat_id: chatId, message_id: messageId },
                )
            } catch (error: any) {
                if (!error.response?.body?.description?.includes('message is not modified')) {
                    console.error('Error removing confirm keyboard:', error)
                }
            }
            await bot.answerCallbackQuery(callbackQuery.id)
        }
    })

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id
        const text = msg.text?.trim()

        if (!text || text.startsWith('/')) return

        const stateKey = RESET_STATE_KEY(chatId)
        const stateData = await redisClient.get(stateKey)
        if (!stateData) return

        let state: { step: string } | null = null
        try {
            state = JSON.parse(stateData)
        } catch (error) {
            console.error('Corrupted state in Redis:', stateData)
            await redisClient.del(stateKey)
            return
        }

        if (state?.step === 'awaiting_new_password') {
            if (text.includes(' ')) {
                await bot.sendMessage(chatId, 'Ошибка: Пароль не должен содержать пробелы.')
                return
            }
            if (text.length < 8) {
                await bot.sendMessage(chatId, 'Ошибка: Пароль должен быть не менее 8 символов.')
                return
            }

            try {
                await UserModel.updatePasswordByTelegramChatId(chatId, text)
                await bot.sendMessage(chatId, 'Пароль успешно изменён!')
                await redisClient.del(stateKey)
            } catch (error) {
                console.error('Error resetting password:', error)
                await bot.sendMessage(chatId, 'Ошибка при сохранении. Попробуйте позже.')
            }
        }
    })

    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const token = match?.[1]
        const chatId = msg.chat.id
        const username = msg.from?.username

        if (!token) {
            await bot.sendMessage(
                chatId,
                'Привет! Чтобы привязать Telegram, перейди по ссылке с сайта.',
            )
            return
        }

        const success = await TelegramService.processDeepLink(token, chatId, username)
        if (!success) {
            await bot.sendMessage(
                chatId,
                username
                    ? `Ошибка: вы авторизованы как ${username}, но ожидался другой аккаунт.`
                    : 'Ошибка: токен недействителен.',
            )
            return
        }

        const user = await TelegramModel.getUserByBindToken(token)
        if (user && username) {
            await TelegramModel.saveChatIdAndUsername(user.id, chatId, username)
        }

        await bot.sendMessage(chatId, `Telegram успешно привязан! Нажмите кнопку:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Подтвердить', callback_data: `confirm_${token}_${chatId}` }],
                ],
            },
        })
    })

    bot.on('polling_error', (error) => console.error('Polling error:', error))

    bot.getMe()
        .then((botInfo) => console.log(`Bot @${botInfo.username} started`))
        .catch((err) => console.error('Bot getMe error:', err))

    console.log('Telegram bot initialized')
    return bot
}

export default bot
