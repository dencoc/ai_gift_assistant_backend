import { Router } from 'express'
import { PhotoController } from '../controllers/photoController'
import { authMiddleware } from '../middlewares/auth'
import { upload } from '../middlewares/upload'

const router = Router()

router.post('/photo/upload', authMiddleware, upload.single('avatar'), PhotoController.uploadAvatar)
router.get('/photo/user/:userId', PhotoController.getAvatarUrl)

export default router
