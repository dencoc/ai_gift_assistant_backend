import { EventService } from '../services/eventService'
import { Request, Response, NextFunction } from 'express'
import { sendResponse } from '../utils/SendResponse'
import { RequestWithUser } from '../types/request'

export class EventController {
    static async getEvents(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id as number

            const limit = parseInt(req.query.limit as string, 10)
            const offset = parseInt(req.query.offset as string, 10)
            const date =
                req.query.date && String(req.query.date) !== 'undefined'
                    ? String(req.query.date)
                    : undefined

            const safeLimit = isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100)
            const safeOffset = isNaN(offset) || offset < 0 ? 0 : offset

            const events = await EventService.getEventsForUser(userId, safeLimit, safeOffset, date)

            return sendResponse(res, events, 'Events found successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async createEvent(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const event = await EventService.createEvent({
                ...req.body,
                user_id: req.user?.id as number,
            })
            return sendResponse(res, event, 'Event created successfully', true, 201)
        } catch (error) {
            next(error)
        }
    }

    static async getEventById(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.getEventById(Number(req.params.id))
            return sendResponse(res, event, 'Event found successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async updateEvent(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const event = await EventService.updateEvent({
                ...req.body,
                user_id: req.user?.id as number,
            })
            return sendResponse(res, event, 'Event updated successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }

    static async deleteEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.deleteEvent(Number(req.params.id))
            return sendResponse(res, event, 'Event deleted successfully', true, 200)
        } catch (error) {
            next(error)
        }
    }
}
