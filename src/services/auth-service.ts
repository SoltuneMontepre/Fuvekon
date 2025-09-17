import { axios } from '../config/axios'
import type { Credentials } from '../types/auth/credentials'

const authApi = {
	login: (credentials: Credentials) =>
		axios.post('/auth/login', credentials).then(res => res.data),
	logout: () => axios.post('/auth/logout').then(res => res.data),
	getUser: () => axios.get('/auth/user').then(res => res.data),
	refreshToken: () => axios.post('/auth/refresh-token').then(res => res.data),
}
export { authApi }
