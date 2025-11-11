import { EventService } from '../services/eventService'
import { Request, Response, NextFunction } from 'express'
import { sendResponse } from '../utils/SendResponse'
import { RequestWithUser } from '../types/request'

export class EventController {
    static async getEvents(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            const events = await EventService.getEventsForUser(
                req.user?.id as number,
                Number(req.query.limit),
                Number(req.query.offset),
                String(req.query.date),
            )
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

    static async updateEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const event = await EventService.updateEvent(req.body)
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
