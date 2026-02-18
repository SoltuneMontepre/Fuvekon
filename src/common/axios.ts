import a from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/utils/logger'

const isDev = process.env.NODE_ENV === 'development'
const devApiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') // no trailing slash

const getBaseUrl = (path: string) =>
	isDev && devApiBase ? `${devApiBase}/v1` : path

const axiosLocal = a.create({
	baseURL: getBaseUrl('/v1'),
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true,
})

const axiosGeneral = a.create({
	baseURL: getBaseUrl('/api/general/v1'),
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true,
})

axiosGeneral.interceptors.response.use(
	response => {
		logger.debug('API Response', {
			url: response.config.url,
			status: response.status,
			method: response.config.method,
		})
		return response
	},
	error => {
		logger.error('API Error', error, {
			url: error.config?.url,
			status: error.response?.status,
			method: error.config?.method,
		})

		if (error.response?.status === 401) {
			logger.warn('401 Unauthorized - Clearing account')
			const { clearAccount, isAuthenticated } = useAuthStore.getState()

			// Only redirect if we thought we were authenticated
			// This prevents race conditions from logging the user out
			if (isAuthenticated) {
				clearAccount()
				// Use router instead of window.location to avoid losing state
				// But only if we're in a browser environment
				if (
					typeof window !== 'undefined' &&
					!window.location.pathname.includes('/login')
				) {
					// Wait a bit to allow other operations to complete
					setTimeout(() => {
						window.location.href = '/login'
					}, 100)
				}
			}
		} else if (error.response?.status === 403) {
			logger.warn('403 Forbidden - Clearing account')
			const { clearAccount } = useAuthStore.getState()
			clearAccount()
		}
		return Promise.reject(error)
	}
)

axiosLocal.interceptors.response.use(
	response => {
		logger.debug('API Response', {
			url: response.config.url,
			status: response.status,
			method: response.config.method,
		})
		return response
	},
	error => {
		logger.error('API Error', error, {
			url: error.config?.url,
			status: error.response?.status,
			method: error.config?.method,
		})

		if (error.response?.status === 401) {
			logger.warn('401 Unauthorized - Clearing account')
			const { clearAccount, isAuthenticated } = useAuthStore.getState()

			// Only redirect if we thought we were authenticated
			// This prevents race conditions from logging the user out
			if (isAuthenticated) {
				clearAccount()
				// Use router instead of window.location to avoid losing state
				// But only if we're in a browser environment
				if (
					typeof window !== 'undefined' &&
					!window.location.pathname.includes('/login')
				) {
					// Wait a bit to allow other operations to complete
					setTimeout(() => {
						window.location.href = '/login'
					}, 100)
				}
			}
		} else if (error.response?.status === 403) {
			logger.warn('403 Forbidden - Clearing account')
			const { clearAccount } = useAuthStore.getState()
			clearAccount()
		}
		return Promise.reject(error)
	}
)

const axios = {
	general: axiosGeneral,
}

export default axios
