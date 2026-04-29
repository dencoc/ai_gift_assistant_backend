import cron from 'node-cron'
import { EventModel } from '../models/eventModel'
import { sendDailyEventReminder } from '../utils/emailUtils'

export class EventReminderScheduler {
    private static running = false

    static start() {
        if (this.running) return
        this.running = true

        cron.schedule(
            '30 8 * * *',
            async () => {
                console.log('Проверка событий для ежедневных напоминаний...')

                try {
                    const events = await EventModel.getEventsNeedingReminder()

                    const now = new Date()
                    now.setHours(0, 0, 0, 0)

                    for (const event of events) {
                        const eventDate = new Date(event.date)
                        eventDate.setHours(0, 0, 0, 0)

                        const diffTime = eventDate.getTime() - now.getTime()
                        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                        if (daysLeft >= 0 && daysLeft <= 7) {
                            await sendDailyEventReminder(
                                event.email,
                                event.title,
                                eventDate,
                                daysLeft,
                            )
                            console.log(
                                `Напоминание отправлено (${daysLeft} дн.): "${event.title}" → ${event.email}`,
                            )
                        }
                    }
                } catch (error) {
                    console.error('Ошибка в шедулере ежедневных напоминаний:', error)
                }
            },
            {
                timezone: 'Europe/Moscow',
            },
        )

        console.log('Ежедневный шедулер напоминаний запущен (8:30 утра)')
    }
}

export default EventReminderScheduler
