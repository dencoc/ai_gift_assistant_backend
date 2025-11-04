import { Router } from 'express'
import { ChatController } from '../controllers/chatController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

router.get('/chat', authMiddleware, ChatController.getAllChatsByUserId)
router.get('/chat/:id', authMiddleware, ChatController.getChatById)
router.post('/chat', authMiddleware, ChatController.createChat)
router.put('/chat', authMiddleware, ChatController.updateChat)
router.patch('/chat/:id', authMiddleware, ChatController.addRecipientToChat)
router.delete('/chat/:id', authMiddleware, ChatController.deleteChat)

export default router
