'use client'

import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import type { PresignRequest, PresignResponse } from '@/types/api/s3/presign'

export function usePresignUrl() {
	return useMutation({
		mutationFn: async (payload: PresignRequest): Promise<PresignResponse> => {
			const { data } = await axios.post<PresignResponse>(
				'/api/s3/presign',
				payload
			)
			return data
		},
		onError: (error: Error) => {
			console.error('Failed to get presigned URL:', error.message)
		},
	})
}
