const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://localhost:8000'

export class AiChatApi {
    static async getStreamResponse(
        context: any,
        message: string,
        onChunk: (chunk: string) => void,
    ) {
        const response = await fetch(`${AI_AGENT_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ context, message }),
        })

        if (!response.body) throw new Error('AI agent stream error')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            onChunk(chunk)
        }
    }
}
