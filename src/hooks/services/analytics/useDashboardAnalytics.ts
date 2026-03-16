'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { ApiResponse } from '@/types/api/response'
import type { DashboardAnalyticsResponse } from '@/types/api/analytics/dashboard'

const DASHBOARD_TIMELINE_MAX_DAYS = 365
const DASHBOARD_TIMELINE_DEFAULT = 90

function clampDays(days: number, defaultVal: number): number {
	if (days <= 0) return defaultVal
	return Math.min(days, DASHBOARD_TIMELINE_MAX_DAYS)
}

export interface DashboardAnalyticsParams {
	timelineDays?: number
	revenueDays?: number
}

/**
 * Single advanced query for all dashboard analytics (ticket stats, sales timeline,
 * revenue, user count, dealer count, users by country). Reduces round-trips and
 * allows the backend to optimize with a consolidated handler.
 */
export function useDashboardAnalytics(params: DashboardAnalyticsParams = {}) {
	const timelineDays = clampDays(
		params.timelineDays ?? DASHBOARD_TIMELINE_DEFAULT,
		DASHBOARD_TIMELINE_DEFAULT
	)
	const revenueDays = clampDays(
		params.revenueDays ?? DASHBOARD_TIMELINE_DEFAULT,
		DASHBOARD_TIMELINE_DEFAULT
	)

	return useQuery({
		queryKey: ['dashboard-analytics', timelineDays, revenueDays],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set('timeline_days', String(timelineDays))
			searchParams.set('revenue_days', String(revenueDays))
			const { data } = await axios.general.get<
				ApiResponse<DashboardAnalyticsResponse>
			>(`/admin/analytics/dashboard?${searchParams.toString()}`)
			return data
		},
		staleTime: 1000 * 60 * 2, // 2 minutes
	})
}
