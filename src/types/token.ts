export interface JWTPayload {
    id: number
    iat: number
    exp: number
}

export interface TokenPair {
    accessToken: string
    refreshToken: string
}
