export interface JWTPayload {
    id?: number
    email?: string
    iat: number
    exp: number
}

export interface TokenPair {
    accessToken: string
    refreshToken: string
}
