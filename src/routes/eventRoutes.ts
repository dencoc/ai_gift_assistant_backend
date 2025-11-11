import express from 'express'
import { EventController } from '../controllers/eventController'
import { authMiddleware } from '../middlewares/auth'
import { validateSchema } from '../middlewares/validateSchema'
import { EventCreateSchema, EventUpdateSchema } from '../schemas/eventSchema'

const router = express.Router()

router.get('/event', authMiddleware, EventController.getEvents)
router.post(
    '/event',
    authMiddleware,
    validateSchema(EventCreateSchema),
    EventController.createEvent,
)
router.get('/event/:id', authMiddleware, EventController.getEventById)
router.put('/event', authMiddleware, validateSchema(EventUpdateSchema), EventController.updateEvent)
router.delete('/event/:id', authMiddleware, EventController.deleteEvent)

export default router
