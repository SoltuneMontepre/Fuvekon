import a from 'axios'
import { useAuthStore } from '@/stores/authStore'

const baseURL = process.env.NEXT_PUBLIC_API_URL
	? process.env.NEXT_PUBLIC_API_URL
	: 'http://localhost:8085'

const isLocal = `${process.env.NEXT_PUBLIC_API_URL}`.includes('localhost')

const axiosLocal = a.create({
	baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
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
	response => response,
	error => {
		if (error.response?.status === 403) {
			const { clearAccount } = useAuthStore.getState()
			clearAccount()
		}
		return Promise.reject(error)
	}
)

axiosTicket.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 403) {
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
