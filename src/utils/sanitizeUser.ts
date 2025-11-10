import { UserResponse, UserResponseWithPassword } from '../types/user'

export const sanitizeUser = (user: any): UserResponse => ({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    surname: user.surname,
    birthdate: user.birthdate,
    gender: user.gender,
    description: user.description,
    telegram_link: user.telegram_link,
    telegram_link_confirmed: user.telegram_link_confirmed,
    telegram_init_id: user.telegram_init_id,
    telegram_username: user.telegram_username,
    avatar: user.avatar,
    created_at: user.created_at,
})

export const sanitizeUserWithPassword = (user: any): UserResponseWithPassword => ({
    ...sanitizeUser(user),
    password: user.password,
})
