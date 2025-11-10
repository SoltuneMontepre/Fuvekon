// Response types theo format của BE
export interface LoginData {
	access_token: string
}

export interface LoginResponse {
	isSuccess: boolean
	message: string
	data: LoginData
	statusCode: number
}
