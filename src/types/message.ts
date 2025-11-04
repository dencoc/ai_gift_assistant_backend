export interface MessageRequest {
    id?: number
    text: string
    chat_id: number
    role: string
    timestamp?: string
}

export interface MessageResponse {
    id: number
    text: string
    chat_id: number
    role: string
    timestamp: string
}
