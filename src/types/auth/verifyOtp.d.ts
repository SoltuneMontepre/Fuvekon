export interface VerifyOtpRequest {
	email: string
	otp: string
}

export interface VerifyOtpResponse {
	isSuccess: boolean
	errorMessage?: string
}
