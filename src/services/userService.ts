import { UserModel } from '../models/userModel'
import {
    UserRequest,
    UserRequestWithPassword,
    UserResponse,
    UserResponseWithPassword,
} from '../types/user'
import { AppError } from '../utils/AppError'
import bcrypt from 'bcrypt'

export class UserService {
    static async createUser(user: UserRequestWithPassword): Promise<UserResponse> {
        user.password = await bcrypt.hash(user.password, 10)
        const userFound = await UserModel.searchUser(user.username, user.email)
        if (userFound) throw new AppError('User already exists', 400)
        const createdUser = await UserModel.createUser(user)
        if (!createdUser) throw new AppError('User not created', 500)
        return createdUser
    }

    static async loginUser(user: UserRequestWithPassword): Promise<UserResponseWithPassword> {
        const userFound = await UserModel.searchUser(user.username, user.email)
        if (!userFound) throw new AppError('User not found', 404)

        const userWithPassword = user.username
            ? await UserModel.getUserByUsernameWithPassword(user.username)
            : await UserModel.getUserByEmailWithPassword(user.email)
        if (!userWithPassword) throw new AppError('User not found', 404)

        const passwordMatch = await bcrypt.compare(user.password, userWithPassword.password)
        if (!passwordMatch) throw new AppError('Invalid password', 400)

        return userWithPassword
    }

    static async getUserById(id: number): Promise<UserResponse | null> {
        if (!id) throw new AppError('User id is required', 400)
        const user = await UserModel.getUserById(id)
        if (!user) throw new AppError('User not found', 404)
        return user
    }

    static async getUserByIdWithPassword(id: number): Promise<UserResponseWithPassword | null> {
        if (!id) throw new AppError('User id is required', 400)
        const user = await UserModel.getUserByIdWithPassword(id)
        if (!user) throw new AppError('User not found', 404)
        return user
    }

    static async getUserByEmail(email: string): Promise<UserResponse | null> {
        if (!email) throw new AppError('User email is required', 400)
        const user = await UserModel.getUserByEmail(email)
        if (!user) throw new AppError('User not found', 404)
        return user
    }

    static async getUserByUsername(username: string): Promise<UserResponse | null> {
        if (!username) throw new AppError('User username is required', 400)
        const user = await UserModel.getUserByUsername(username)
        if (!user) throw new AppError('User not found', 404)
        return user
    }

    static async getUserByUsernameWithPassword(
        username: string,
    ): Promise<UserResponseWithPassword | null> {
        if (!username) throw new AppError('User username is required', 400)
        const user = await UserModel.getUserByUsernameWithPassword(username)
        if (!user) throw new AppError('User not found', 404)
        return user
    }

    static async searchUser(username: string, email: string): Promise<UserResponse[] | null> {
        if (!username && !email) throw new AppError('User username or email is required', 400)
        const users = await UserModel.searchUser(username, email)
        return users
    }

    static async updateUser(user: UserRequest): Promise<UserResponse> {
        if (!user.id) throw new AppError('User id is required', 400)
        const updatedUser = await UserModel.updateUser(user)
        if (!updatedUser) throw new AppError('User not updated', 500)
        return updatedUser
    }

    static async updateUserPassword(email: string, password: string): Promise<UserResponse> {
        if (!email) throw new AppError('email is required', 400)
        if (!password) throw new AppError('User password is required', 400)
        password = await bcrypt.hash(password, 10)
        const updatedUser = await UserModel.updateUserPassword(email, password)
        if (!updatedUser) throw new AppError('User not updated', 500)
        return updatedUser
    }

    static async verifyEmail(id: number): Promise<boolean> {
        if (!id) throw new AppError('User id is required', 400)
        const status = await UserModel.verifyEmail(id)
        if (!status) throw new AppError('User not updated', 500)
        return status
    }

    static async deleteUser(id: number): Promise<boolean> {
        if (!id) throw new AppError('User id is required', 400)
        const status = await UserModel.deleteUser(id)
        if (!status) throw new AppError('User not deleted', 500)
        return status
    }
}
