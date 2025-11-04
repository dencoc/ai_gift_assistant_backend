export interface ChatRequest {
    id?: number
    sender_id: number
    recipient_id?: number
    title: string
    context: string
}

export interface ChatResponse {
    id: number
    sender_id: number
    recipient_id?: number
    title: string
    context: string
}
