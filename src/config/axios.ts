import a from 'axios'

const ApiUrl = import.meta.env.VITE_API_URL

const config = {
	baseURL: ApiUrl,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
}

const axios = a.create(config)
const axiosInstance = a.create(config)

axiosInstance.interceptors.request.use(config => {
	return config
})

export { axios, axiosInstance }
