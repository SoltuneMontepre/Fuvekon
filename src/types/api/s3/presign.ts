import type { ApiResponse } from '@/types/api/response'

/**
 * Request payload for getting a presigned URL
 */
export interface PresignRequest {
	fileName: string
	fileType: string
	/** Optional folder/path prefix in S3 bucket */
	folder?: string
	/** Optional expiration time in seconds (default: 3600) */
	expiresIn?: number
}

/**
 * Response data containing the presigned URL and file key
 */
export interface PresignResponseData {
	presignedUrl: string
	fileKey: string
	/** Full URL to access the file after upload */
	fileUrl: string
}

/**
 * API Response for presign endpoint
 */
export type PresignResponse = ApiResponse<PresignResponseData>
