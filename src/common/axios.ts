import a from 'axios'
import { useAuthStore } from '@/stores/authStore'

// General service axios instance (auth, users, etc.)
// Runs on port 8085 in local dev
const generalServiceAxios = a.create({
	baseURL: process.env.NEXT_PUBLIC_GENERAL_SERVICE_URL || 'http://localhost:8085/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true, // Send cookies with requests
})

// Ticket service axios instance (tickets, payments, etc.)
// Runs on port 8081 in local dev
const ticketServiceAxios = a.create({
	baseURL: process.env.NEXT_PUBLIC_TICKET_SERVICE_URL || 'http://localhost:8081/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true, // Send cookies with requests
})

// Add request interceptor to include Authorization header
const addAuthInterceptor = (instance: any) => {
	instance.interceptors.request.use(
		(config: any) => {
			// Get token from auth store using getState() (works outside React)
			const { token } = useAuthStore.getState()
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
			return config
		},
		(error: any) => {
			return Promise.reject(error)
		}
	)
}

// Apply auth interceptor to both instances
addAuthInterceptor(generalServiceAxios)
addAuthInterceptor(ticketServiceAxios)

// Default export for backward compatibility (points to general service)
const axios = generalServiceAxios

export default axios
export { generalServiceAxios, ticketServiceAxios }
