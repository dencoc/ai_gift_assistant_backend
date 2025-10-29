import express from 'express'
import { UserController } from '../controllers/userController'
import { validateSchema } from '../middlewares/validateSchema'
import { UserLoginSchema, UserRegisterSchema, UserUpdateSchema } from '../schemas/userSchema'
import { authMiddleware } from '../middlewares/auth'
import { TokenController } from '../controllers/tokenController'

const router = express.Router()

router.get('/token/refresh', TokenController.updateRefreshToken)
router.get('/user/me', authMiddleware, UserController.getMe)
router.get('/user/:id', authMiddleware, UserController.getUserById)
router.get('/user/search', authMiddleware, UserController.searchUser)
router.post('/user/reset-password', UserController.sendResetEmail)
router.post('/user/login', validateSchema(UserLoginSchema), UserController.loginUser)
router.post('/user/logout', authMiddleware, UserController.logout)
router.post('/user/register', validateSchema(UserRegisterSchema), UserController.createUser)
router.put('/user', authMiddleware, validateSchema(UserUpdateSchema), UserController.updateUser)
router.patch('/user/verify-email', authMiddleware, UserController.verifyEmail)
router.patch('/user/password', authMiddleware, UserController.updatePassword)
router.delete('/user', authMiddleware, UserController.deleteUser)

export default router
