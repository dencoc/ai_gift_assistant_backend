import express from 'express'
import { UserController } from '../controllers/userController'
import { validateSchema } from '../middlewares/validateSchema'
import { UserLoginSchema, UserRegisterSchema, UserUpdateSchema } from '../schemas/userSchema'
import { authMiddleware } from '../middlewares/auth'

const router = express.Router()

router.post('/user/register', validateSchema(UserRegisterSchema), UserController.createUser)

export default router
    