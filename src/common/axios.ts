import a from 'axios'
import { useAuthStore } from '@/stores/authStore'

const axios = a.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true, // Để gửi và nhận cookies
})

// Response interceptor to handle 403 errors
axios.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 403) {
			// Clear account store on 403 Forbidden
			const { clearAccount } = useAuthStore.getState()
			clearAccount()
		}
		return Promise.reject(error)
	}
)

export default axios
