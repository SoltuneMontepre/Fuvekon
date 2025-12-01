import a from 'axios'
import { useAuthStore } from '@/stores/authStore'

const baseURL =
	`${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:8085/api'

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
	general: axiosGeneral,
	ticket: axiosTicket,
}

export default axios
