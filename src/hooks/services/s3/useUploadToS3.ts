'use client'

import { useState } from 'react'
import axios from 'axios'
import { usePresignUrl } from './usePresignUrl'
import type { PresignRequest } from '@/types/api/s3/presign'

export interface UploadToS3Options {
	onSuccess?: (fileUrl: string, fileKey: string) => void
	onError?: (error: Error) => void
	onProgress?: (progress: number) => void
}

export interface UploadToS3Result {
	uploadFile: (file: File, options?: Partial<PresignRequest>) => Promise<void>
	isUploading: boolean
	progress: number
	error: Error | null
}

/**
 * Hook for uploading files to S3 using presigned URLs
 *
 * @example
 * ```tsx
 * const { uploadFile, isUploading, error } = useUploadToS3({
 *   onSuccess: (fileUrl, fileKey) => {
 *     // Save file info to DB
 *   }
 * })
 *
 * const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0]
 *   if (file) {
 *     await uploadFile(file, { folder: 'uploads' })
 *   }
 * }
 * ```
 */
export function useUploadToS3(options?: UploadToS3Options): UploadToS3Result {
	const [isUploading, setIsUploading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [error, setError] = useState<Error | null>(null)
	const { mutateAsync: getPresignedUrl } = usePresignUrl()

	const uploadFile = async (
		file: File,
		presignOptions?: Partial<PresignRequest>
	) => {
		setIsUploading(true)
		setProgress(0)
		setError(null)

		try {
			// Step 1: Get presigned URL from backend
			const presignResponse = await getPresignedUrl({
				fileName: file.name,
				fileType: file.type,
				expiresIn: 3600, // 1 hour default
				...presignOptions,
			})

			if (!presignResponse.isSuccess || !presignResponse.data) {
				throw new Error(
					presignResponse.message || 'Failed to get presigned URL'
				)
			}

			const { presignedUrl, fileKey, fileUrl } = presignResponse.data

			// Step 2: Upload file directly to S3 using presigned URL
			await axios.put(presignedUrl, file, {
				headers: {
					'Content-Type': file.type,
				},
				onUploadProgress: progressEvent => {
					if (progressEvent.total) {
						const percentComplete =
							(progressEvent.loaded / progressEvent.total) * 100
						setProgress(percentComplete)
						options?.onProgress?.(percentComplete)
					}
				},
			})

			// Step 3: Call success callback
			options?.onSuccess?.(fileUrl, fileKey)

			// Step 4: Optionally save file info to DB
			// This would be a separate API call to your backend
			// await saveFileInfo({ fileKey, fileUrl, fileName: file.name, ... })
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Upload failed')
			setError(error)
			options?.onError?.(error)
			throw error
		} finally {
			setIsUploading(false)
			setProgress(0)
		}
	}

	return {
		uploadFile,
		isUploading,
		progress,
		error,
	}
}
