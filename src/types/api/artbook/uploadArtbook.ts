import { z } from 'zod'
import { ERROR_MESSAGES } from '@/utils/validation/registerValidation.constants'

const ALLOWED_FILE_EXTENSIONS = [
	'.jpg',
	'.jpeg',
	'.png',
	// '.webp',
	// '.gif',
	// '.bmp',
	'.doc',
	'.docx',
	'.pdf',
]

const isAllowedFileUrl = (value: string): boolean => {
	try {
		const url = new URL(value)
		const pathname = url.pathname.toLowerCase()
		return ALLOWED_FILE_EXTENSIONS.some(ext => pathname.endsWith(ext))
	} catch {
		return false
	}
}

export const ArtbookFormSchema = z.object({
	title: z
		.string()
		.min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	description: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	handle: z.string().min(1, ERROR_MESSAGES.REQUIRED_FIELD),
	image_url: z
		.string()
		.nullable()
		.refine(value => value === null || isAllowedFileUrl(value), {
			message: 'Only image/document URLs are allowed.',
		}),
	// fileKey: z.string().nullable(),
})

export type UploadArtbookFormData = z.infer<typeof ArtbookFormSchema>

export const mapArtbookToApiRequest = (
	data: UploadArtbookFormData
): import('@/types/api/artbook/uploadArtbook.d').UploadArtbookRequest => ({
	title: data.title,
	description: data.description,
	handle: data.handle,
	image_url: data.image_url,
	// fileKey: data.fileKey,
})
