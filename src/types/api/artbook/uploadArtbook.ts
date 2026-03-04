import { z } from 'zod'
import { ERROR_MESSAGES } from '@/utils/validation/registerValidation.constants'

// Form schema for verifying OTP
export const ArtbookFormSchema = z.object({
	title: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	description: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	handle: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	imageUrl: z.string().nullable(),
	// fileKey: z.string().nullable(),
})

export type UploadArtbookFormData = z.infer<typeof ArtbookFormSchema>

export const mapArtbookToApiRequest = (
	data: UploadArtbookFormData
): import('@/types/api/artbook/uploadArtbook.d').UploadArtbookRequest => ({
	title: data.title,
	description: data.description,
	handle: data.handle,
	imageUrl: data.imageUrl,
	// fileKey: data.fileKey,
})
