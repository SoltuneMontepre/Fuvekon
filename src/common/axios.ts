import a from 'axios'

const axios = a.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true, // Để gửi và nhận cookies
})

export default axios
