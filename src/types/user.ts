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
}

export interface UserResponseWithPassword extends UserResponse {
    password: string
}
