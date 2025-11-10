import { EventModel } from '../models/eventModel'
import { EventRequest, EventResponse } from '../types/event'
import { AppError } from '../utils/AppError'
import { UserService } from './userService'

export class EventService {
    static async createEvent(event: EventRequest): Promise<EventResponse> {
        if (!event) throw new AppError('Information is required', 400)
        await UserService.getUserById(event.user_id)
        await UserService.getUserById(event.recipient_id as number)
        return await EventModel.create(event)
    }

    static async getEventsForUser(
        userId: number,
        limit: number,
        offset: number,
        date: string,
    ): Promise<EventResponse[]> {
        if (!userId) throw new AppError('User id is required', 400)
        await UserService.getUserById(userId)
        return await EventModel.getEventsForUser(userId, limit, offset, date)
    }

    static async getEventById(id: number): Promise<EventResponse | null> {
        if (!id) throw new AppError('Event id is required', 400)
        return await EventModel.getEventById(id)
    }

    static async updateEvent(event: EventRequest): Promise<EventResponse> {
        if (!event) throw new AppError('Information is required', 400)
        await UserService.getUserById(event.user_id)
        await UserService.getUserById(event.recipient_id as number)
        return await EventModel.updateEvent(event)
    }

    static async deleteEvent(id: number): Promise<void> {
        if (!id) throw new AppError('Event id is required', 400)
        await EventModel.deleteEvent(id)
    }
}
