import a from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { logger } from '@/utils/logger'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'
// const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'

const isLocal = baseURL.includes('localhost')

const axiosLocal = a.create({
	baseURL: `${baseURL}/v1`,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true,
})

const axiosGeneral = a.create({
	baseURL: `${baseURL}/general/v1`,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true,
})

const axiosTicket = a.create({
	baseURL: `${baseURL}/ticket/v1`,
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

axiosTicket.interceptors.response.use(
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
	general: isLocal ? axiosLocal : axiosGeneral,
	ticket: isLocal ? axiosLocal : axiosTicket,
}

export default axios
