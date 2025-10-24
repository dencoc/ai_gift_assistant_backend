export interface JWTPayload {
    email: string
    iat: number
    exp: number
}

export interface TokenPair {
    accessToken: string
    refreshToken: string
}
