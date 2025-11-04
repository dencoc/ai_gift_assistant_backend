export interface EventRequest {
    id?: number
    title: string
    description?: string
    date: string
    importance_id: number
    recipient_id?: number
    completed?: boolean
    user_id: number
}

export interface EventResponse {
    id: number
    title: string
    description: string
    date: string
    importance_id: number
    recipient_id: number
    completed: boolean
}
