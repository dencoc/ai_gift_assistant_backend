export interface UserRequest {
    id?: number
    email: string
    username: string
    name?: string
    surname?: string
    birthdate?: string
    gender?: string
    description?: string
    telegram_link?: string
    telegram_link_confirmed?: boolean
    telegram_username?: string
    telegram_init_id?: string
    avatar?: string
}

export interface UserRequestWithPassword extends UserRequest {
    password: string
}

export interface UserResponse {
    id: number
    email: string
    username: string
    name?: string
    surname?: string
    birthdate?: string
    gender?: string
    description?: string
    telegram_link?: string
    telegram_link_confirmed?: boolean
    telegram_username?: string
    telegram_init_id?: string
    avatar?: string
    created_at?: Date
}

export interface UserResponseWithPassword extends UserResponse {
    password: string
}

export type UserRequestInput = UserRequest | FormData

export type UserRequestWithPasswordInput = UserRequestWithPassword | FormData
