import type { TicketStatistics } from '../../models/ticket/ticket'
import type { GetTicketRevenueResponse } from '../ticket/ticket'
import type { CountByCountryItem } from '../user/user'

/** One day in sales timeline (API shape uses date/count) */
export interface SalesByDayItem {
	date: string
	count: number
}

/** Consolidated dashboard analytics response (single API call) */
export interface DashboardAnalyticsResponse {
	ticket_stats: TicketStatistics
	sales_timeline: SalesByDayItem[]
	revenue: GetTicketRevenueResponse
	user_count: number
	dealer_count: number
	users_by_country: CountByCountryItem[]
}
