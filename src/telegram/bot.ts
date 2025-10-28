import TelegramBot from 'node-telegram-bot-api'
import { TelegramService } from '../services/telegramService'
import { TelegramModel } from '../models/telegramModel'

const bot = new TelegramBot(process.env.TG_BOT_TOKEN!, { polling: true })

export function initTelegramBot() {
    bot.onText(/\/start (.+)/, async (msg, match) => {
        try {
            const token = match?.[1]
            const chatId = msg.chat.id
            const username = msg.from?.username

            if (!token) {
                try {
                    await bot.sendMessage(
                        chatId,
                        '👋 Привет! Чтобы привязать Telegram, перейди по ссылке с сайта. ' +
                            'Если у тебя нет Telegram, скачай приложение или войди через https://web.telegram.org',
                    )
                } catch (error) {
                    console.error('Error sending welcome message:', error)
                }
                return
            }

            const success = await TelegramService.processDeepLink(token, chatId, username)

            if (!success) {
                try {
                    await bot.sendMessage(
                        chatId,
                        username
                            ? `❌ Ошибка: вы авторизованы как ${username}, но ожидался другой Telegram-аккаунт, или токен недействителен.`
                            : '❌ Ошибка: токен недействителен или ваш аккаунт не имеет username.',
                    )
                } catch (error) {
                    console.error('Error sending error message:', error)
                }
                return
            }

            const user = await TelegramModel.getUserByBindToken(token)
            if (user && username) {
                await TelegramModel.saveChatIdAndUsername(user.id, chatId, username)
            }

            try {
                await bot.sendMessage(
                    chatId,
                    `✅ Telegram успешно привязан! Нажмите кнопку для подтверждения:`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Подтвердить',
                                        callback_data: `confirm_${token}_${chatId}`,
                                    },
                                ],
                            ],
                        },
                    },
                )
            } catch (error) {
                console.error('Error sending confirmation message:', error)
            }
        } catch (error) {
            console.error('Error processing /start command:', error)
        }
    })

    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id
        const data = callbackQuery.data

        if (!chatId || !data) {
            return
        }

        const [action, token, chatIdFromCallback] = data.split('_')

        if (action === 'confirm' && chatId.toString() === chatIdFromCallback) {
            try {
                const user = await TelegramModel.getUserByBindToken(token)
                if (user) {
                    await TelegramModel.confirmTelegramLink(user.id, chatId)
                    await bot.sendMessage(chatId, '✅ Привязка Telegram подтверждена!')
                } else {
                    await bot.sendMessage(chatId, '❌ Ошибка: токен не найден.')
                }
            } catch (error) {
                await bot.sendMessage(chatId, '❌ Ошибка при подтверждении.')
            }
        }

        try {
            await bot.editMessageReplyMarkup(
                { inline_keyboard: [] },
                {
                    chat_id: chatId,
                    message_id: callbackQuery.message?.message_id,
                },
            )
        } catch (error) {
            console.error('Error removing inline keyboard:', error)
        }
    })

    bot.on('polling_error', (error) => {
        console.error('Polling error:', error)
    })

    return bot
}

export default bot
