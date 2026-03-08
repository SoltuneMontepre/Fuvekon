import type { ApiResponse } from '../response'

/** Request: Google ID token from Google Sign-In */
export interface GoogleLoginRequest {
	credential: string
}

/** Response: same as email login – backend sets cookie and returns success */
export interface GoogleLoginData {
	access_token?: string
}

export type GoogleLoginResponse = ApiResponse<GoogleLoginData>
