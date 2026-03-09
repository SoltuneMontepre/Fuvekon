'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '@/common/axios'
import type {
  UploadArtbookRequest,
  UploadArtbookResponse,
} from '@/types/api/artbook/uploadArtbook.d'
import type { ApiResponse } from '@/types/api/response'
import type { PaginationMeta } from '@/types/api/ticket/ticket'
import { getQueryClient } from '@/utils/getQueryClient'
// import { logger } from '@/utils/logger'

export type MyConbookItem = UploadArtbookResponse & {
	created_at?: string
	createdAt?: string
	is_verified?: boolean
}

export type AdminConbookItem = MyConbookItem & {
	user_id?: string
	user_name?: string
	user_email?: string
	fursona_name?: string
	user?: {
		id?: string
		user_name?: string
		email?: string
		fursona_name?: string
	}
}

export interface AdminConbookFilter {
	page?: number
	page_size?: number
	search?: string
	status?: 'pending' | 'verified'
}

export interface AdminGetConbooksResponseWithMeta
	extends ApiResponse<AdminConbookItem[]> {
	meta?: PaginationMeta
}

const conbookKeys = {
	mySubmissions: ['my-conbook-submissions'] as const,
	adminSubmissions: (filter: AdminConbookFilter) =>
		['admin-conbook-submissions', filter] as const,
}

const ConbookApi = {
	upload: async (payload: UploadArtbookRequest) => {
		const { data } = await axios.general.post<UploadArtbookResponse>(
			'/conbooks/upload',
			payload
		)
		return data
	},
	update: async (id: string, payload: UploadArtbookRequest) => {
		const { data } = await axios.general.put<UploadArtbookResponse>(
			`/conbooks/${id}`,
			payload
		)
		return data
	},
	getMySubmissions: async () => {
		const { data } = await axios.general.get<ApiResponse<MyConbookItem[]>>(
			'/conbooks'
		)
		return data
	},
	getAdminSubmissions: async (filter: AdminConbookFilter = {}) => {
		const params = new URLSearchParams()
		if (filter.page != null) params.append('page', filter.page.toString())
		if (filter.page_size != null) {
			params.append('page_size', filter.page_size.toString())
		}
		if (filter.search?.trim()) params.append('search', filter.search.trim())

		const queryString = params.toString()
		const status = filter.status ?? 'pending'
		const url = `/admin/conbooks/${status}${queryString ? `?${queryString}` : ''}`

		const { data } =
			await axios.general.get<AdminGetConbooksResponseWithMeta>(url)
		return data
	},
	verifyByAdmin: async (id: string) => {
		const { data } = await axios.general.patch<ApiResponse<MyConbookItem>>(
			`/admin/conbooks/${id}/verify`
		)
		return data
	},
	delete: async (id: string) => {
		const { data } = await axios.general.delete<UploadArtbookResponse>(
			`/conbooks/${id}`
		)
		return data
	},
}

export function useGetMyConbooks() {
	return useQuery({
		queryKey: conbookKeys.mySubmissions,
		queryFn: () => ConbookApi.getMySubmissions(),
		retry: false,
		staleTime: 1000 * 30,
	})
}

export function useAdminGetConbooks(filter: AdminConbookFilter = {}) {
	return useQuery({
		queryKey: conbookKeys.adminSubmissions(filter),
		queryFn: () => ConbookApi.getAdminSubmissions(filter),
		staleTime: 1000 * 30,
	})
}

export function useUploadArtbook() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: async (payload: UploadArtbookRequest) => {
			return ConbookApi.upload(payload)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: conbookKeys.mySubmissions })
		},
	})
}

export function useUpdateConbookSubmission() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string
			payload: UploadArtbookRequest
		}) => {
			return ConbookApi.update(id, payload)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: conbookKeys.mySubmissions })
		},
	})
}

export function useDeleteConbookSubmission() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			return ConbookApi.delete(id)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: conbookKeys.mySubmissions })
		},
	})
}

export function useAdminVerifyConbook() {
	const queryClient = getQueryClient()

	return useMutation({
		mutationFn: (id: string) => ConbookApi.verifyByAdmin(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['admin-conbook-submissions'],
			})
			queryClient.invalidateQueries({ queryKey: conbookKeys.mySubmissions })
		},
	})
}
