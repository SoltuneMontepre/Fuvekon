'use client'

import { useMutation } from '@tanstack/react-query'
import type { PresignRequest, PresignResponse } from '@/types/api/s3/presign'

export function usePresignUrl() {
	return useMutation({
		mutationFn: async (payload: PresignRequest): Promise<PresignResponse> => {
			// Call Next.js API route directly (not the backend API)
			const response = await fetch('/api/s3/presign', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({
					message: `HTTP error! status: ${response.status}`,
				}))
				throw new Error(errorData.message || 'Failed to get presigned URL')
			}

			const data: PresignResponse = await response.json()
			return data
		},
		onError: (error: Error) => {
			console.error('Failed to get presigned URL:', error.message)
		},
	})
}
