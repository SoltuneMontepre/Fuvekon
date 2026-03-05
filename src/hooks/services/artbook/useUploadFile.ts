'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '@/common/axios'
import type {
  UploadArtbookRequest,
  UploadArtbookResponse,
} from '@/types/api/artbook/uploadArtbook.d'
import type { ApiResponse } from '@/types/api/response'
import { getQueryClient } from '@/utils/getQueryClient'
// import { logger } from '@/utils/logger'

export type MyConbookItem = UploadArtbookResponse & {
	created_at?: string
	createdAt?: string
	is_verified?: boolean
}

const conbookKeys = {
	mySubmissions: ['my-conbook-submissions'] as const,
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
		const { data } = await axios.general.patch<UploadArtbookResponse>(
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
}

export function useGetMyConbooks() {
	return useQuery({
		queryKey: conbookKeys.mySubmissions,
		queryFn: () => ConbookApi.getMySubmissions(),
		retry: false,
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
