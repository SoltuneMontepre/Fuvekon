import a from 'axios'

// General service axios instance (auth, users, etc.)
// Runs on port 8085 in local dev
const generalServiceAxios = a.create({
	baseURL: process.env.NEXT_PUBLIC_GENERAL_SERVICE_URL || 'http://localhost:8085/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true, 
})

// Ticket service axios instance (tickets, payments, etc.)
// Runs on port 8081 in local dev
const ticketServiceAxios = a.create({
	baseURL: process.env.NEXT_PUBLIC_TICKET_SERVICE_URL || 'http://localhost:8081/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000,
	withCredentials: true, 
})

// Default export for backward compatibility (points to general service)
const axios = generalServiceAxios

export default axios
export { generalServiceAxios, ticketServiceAxios }
