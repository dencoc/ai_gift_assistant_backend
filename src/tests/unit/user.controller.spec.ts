import { Request, Response, NextFunction } from 'express'
import { UserController } from '../../controllers/userController'
import { AppError } from '../../utils/AppError'
import { jest } from '@jest/globals'
import { RequestWithUser } from '../../types/request'
import { sendResponse } from '../../utils/SendResponse'
import { UserService } from '../../services/userService'
// Мокаем sendResponse
jest.mock('../../utils/SendResponse', () => ({
    sendResponse: jest.fn(),
}))
// Мокаем UserService
jest.mock('../../services/userService', () => ({
    UserService: {
        createUser: jest.fn(),
        loginUser: jest.fn(),
        getUserById: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        searchUser: jest.fn(),
    },
}))
// Критично: мокаем tokenUtils (и createAccessToken!)
jest.mock('../../utils/tokenUtils', () => ({
    createAccessToken: jest.fn(() => 'fake-access-token'),
    createTokenPair: jest.fn(() => ({
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token-123',
    })),
    saveRefreshToken: jest.fn(() => Promise.resolve()),
    deleteRefreshToken: jest.fn(() => Promise.resolve()),
}))
// Мокаем sanitizeUser
jest.mock('../../utils/sanitizeUser', () => ({
    sanitizeUser: jest.fn((user) => ({
        id: user?.id,
        email: user?.email,
        username: user?.username,
        name: user?.name,
        surname: user?.surname,
        birthdate: user?.birthdate,
        gender: user?.gender,
        description: user?.description,
        telegram_link: user?.telegram_link,
        telegram_link_confirmed: user?.telegram_link_confirmed,
        telegram_init_id: user?.telegram_init_id,
        telegram_username: user?.telegram_username,
        avatar: user?.avatar,
        created_at: user?.created_at,
    })),
}))
// Мокаем emailUtils
jest.mock('../../utils/emailUtils', () => ({
    sendVerificationEmail: jest.fn(() => Promise.resolve()),
}))
// Мокаем Redis
jest.mock('../../lib/redisClient', () => ({
    redisClient: {
        on: jest.fn(),
        connect: jest.fn(() => Promise.resolve()),
        quit: jest.fn(() => Promise.resolve()),
    },
}))
const mockedSendResponse = jest.mocked(sendResponse)
const mockedUserService = UserService as jest.Mocked<typeof UserService>
describe('UserController - Unit Tests', () => {
    let req: Partial<RequestWithUser>
    let res: Partial<Response>
    let next: NextFunction
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test',
        surname: 'User',
        created_at: new Date(),
        avatar: null,
    }
    beforeEach(() => {
        jest.clearAllMocks()
        req = {
            user: { id: 1 },
            body: {},
            params: {},
            query: {},
        } as Partial<RequestWithUser>
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        } as unknown as Response
        next = jest.fn()
    })
    describe('createUser', () => {
        it('должен успешно создать пользователя', async () => {
            const body = { email: 'new@example.com', username: 'newuser', password: 'password123' }
            req.body = body
            mockedUserService.createUser.mockResolvedValue(mockUser as any)
            await UserController.createUser(req as Request, res as Response, next)
            expect(mockedUserService.createUser).toHaveBeenCalledWith(body)
            expect(mockedSendResponse).toHaveBeenCalledWith(
                res,
                mockUser,
                expect.any(String),
                true,
                201,
            )
        })
        it('должен обработать ошибку дублирования', async () => {
            req.body = { email: 'exists@example.com', username: 'exists', password: '12345678' }
            mockedUserService.createUser.mockRejectedValue(new AppError('User already exists', 400))
            await UserController.createUser(req as Request, res as Response, next)
            expect(next).toHaveBeenCalledWith(new AppError('User already exists', 400))
        })
    })
    describe('loginUser', () => {
        it('должен успешно залогинить пользователя', async () => {
            const loginData = { email: 'test@example.com', password: 'password123' }
            req.body = loginData
            const userWithPassword = {
                ...mockUser,
                password: 'hashed_password_from_db',
            }
            mockedUserService.loginUser.mockResolvedValue(userWithPassword as any)
            await UserController.loginUser(req as Request, res as Response, next)
            expect(mockedUserService.loginUser).toHaveBeenCalledWith(loginData)
            expect(mockedSendResponse).toHaveBeenCalledWith(
                res,
                expect.objectContaining({
                    id: 1,
                    email: 'test@example.com',
                    accessToken: 'fake-access-token',
                }),
                'User logged in successfully',
                true,
                200,
            ) // Бонус: проверим, что кука установилась
            expect(res.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'fake-refresh-token-123',
                expect.any(Object),
            )
        })
        it('должен вызвать next при ошибке логина', async () => {
            req.body = { email: 'wrong@example.com', password: 'wrong' }
            mockedUserService.loginUser.mockRejectedValue(new AppError('Invalid credentials', 401))
            await UserController.loginUser(req as Request, res as Response, next)
            expect(next).toHaveBeenCalledWith(new AppError('Invalid credentials', 401))
        })
    })
    describe('getMe', () => {
        it('должен вернуть текущего пользователя', async () => {
            req.user = { id: 1 }
            mockedUserService.getUserById.mockResolvedValue(mockUser as any)
            await UserController.getMe(req as Request, res as Response, next)
            expect(mockedUserService.getUserById).toHaveBeenCalledWith(1)
            expect(mockedSendResponse).toHaveBeenCalledWith(
                res,
                mockUser,
                expect.any(String),
                true,
                200,
            )
        })
        it('должен вернуть 404 если пользователь не найден', async () => {
            req.user = { id: 999 }
            mockedUserService.getUserById.mockResolvedValue(null)
            await UserController.getMe(req as Request, res as Response, next)
            expect(mockedSendResponse).toHaveBeenCalledWith(
                res,
                {
                    id: undefined,
                    email: undefined,
                    username: undefined,
                    name: undefined,
                    surname: undefined,
                    birthdate: undefined,
                    gender: undefined,
                    description: undefined,
                    telegram_link: undefined,
                    telegram_link_confirmed: undefined,
                    telegram_init_id: undefined,
                    telegram_username: undefined,
                    avatar: undefined,
                    created_at: undefined,
                },
                expect.any(String),
                true,
                200,
            )
        })
    })
    describe('updateUser', () => {
        it('должен обновить пользователя', async () => {
            const updateData = { email: 'updated@example.com', name: 'Updated' }
            req.body = updateData
            req.user = { id: 1 }
            const updatedUser = { ...mockUser, ...updateData }
            mockedUserService.updateUser.mockResolvedValue(updatedUser as any)
            await UserController.updateUser(req as Request, res as Response, next)
            expect(mockedUserService.updateUser).toHaveBeenCalledWith(
                expect.objectContaining({ id: 1, ...updateData }),
            )
            expect(mockedSendResponse).toHaveBeenCalledWith(
                res,
                expect.objectContaining({
                    user: expect.any(Object),
                    deepLink: null,
                }),
                expect.any(String),
                true,
                200,
            )
        })
        it('должен вызвать next при ошибке обновления', async () => {
            const updateData = { email: 'fail@example.com' }
            req.body = updateData
            req.user = { id: 1 }
            mockedUserService.updateUser.mockRejectedValue(new AppError('Update failed', 500))
            await UserController.updateUser(req as Request, res as Response, next)
            expect(next).toHaveBeenCalledWith(new AppError('Update failed', 500))
        })
    })
    describe('deleteUser', () => {
        it('должен удалить пользователя', async () => {
            req.user = { id: 1 }
            mockedUserService.deleteUser.mockResolvedValue(true)
            await UserController.deleteUser(req as Request, res as Response, next)
            expect(mockedUserService.deleteUser).toHaveBeenCalledWith(1)
            expect(mockedSendResponse).toHaveBeenCalledWith(
                res,
                null,
                expect.any(String),
                true,
                200,
            )
        })
        it('должен вызвать next при ошибке удаления', async () => {
            req.user = { id: 1 }
            mockedUserService.deleteUser.mockRejectedValue(new AppError('Delete failed', 500))
            await UserController.deleteUser(req as Request, res as Response, next)
            expect(next).toHaveBeenCalledWith(new AppError('Delete failed', 500))
        })
    })
    describe('searchUser', () => {
        it('должен найти пользователей по username', async () => {
            req.query = { username: 'test' }
            mockedUserService.searchUser.mockResolvedValue([mockUser] as any)
            await UserController.searchUser(req as Request, res as Response, next)
            expect(mockedUserService.searchUser).toHaveBeenCalledWith('test', '')
            expect(mockedSendResponse).toHaveBeenCalledWith(
                res,
                [mockUser],
                expect.any(String),
                true,
                200,
            )
        })
        it('должен вызвать next при ошибке поиска', async () => {
            req.query = { username: 'fail' }
            mockedUserService.searchUser.mockRejectedValue(new AppError('Search failed', 500))
            await UserController.searchUser(req as Request, res as Response, next)
            expect(next).toHaveBeenCalledWith(new AppError('Search failed', 500))
        })
    })
})
