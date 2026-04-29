import express from 'express'
import { MessageController } from '../controllers/messageController'
import { authMiddleware } from '../middlewares/auth'

const router = express.Router()

router.get('/message/:id', authMiddleware, MessageController.getMessagesByChatId)
router.post('/message/stream', authMiddleware, MessageController.stream)

export default router
    