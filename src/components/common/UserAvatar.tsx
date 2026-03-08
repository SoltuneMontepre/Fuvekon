'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Camera, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import S3Image from './S3Image'
import { Account } from '@/types/models/auth/account'
import { useTranslations } from 'next-intl'
import {
	useUploadToS3,
	type UploadToS3Options,
} from '@/hooks/services/s3/useUploadToS3'
import type { PresignRequest } from '@/types/api/s3/presign'
import { compressImage } from '@/utils/imageCompression'

export interface UserAvatarProps {
	/** Account data to display */
	account: Account
	/** Diameter in pixels. Defaults to 136 (equivalent to the original w-34/h-34) */
	size?: number
	/** When true, hovering shows a camera icon and clicking opens the file picker */
	uploadable?: boolean
	/** S3 folder for uploads */
	folder?: string
	/** Max allowed file size in MB. Defaults to 5 */
	maxSizeMB?: number
	/** Compress the image before uploading. Defaults to true */
	compressBeforeUpload?: boolean
	/** Called with the raw S3 file URL and key after a successful upload */
	onUploadSuccess?: (fileUrl: string, fileKey: string) => void
	/** Called when an upload fails */
	onUploadError?: (error: Error) => void
	/** Called when the user removes the current avatar (only shown when uploadable and an avatar exists) */
	onRemove?: () => void
	/** Additional class names for the outer container */
	className?: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({
	account,
	size = 136,
	uploadable = false,
	folder = 'user-uploads',
	maxSizeMB = 5,
	compressBeforeUpload = true,
	onUploadSuccess,
	onUploadError,
	onRemove,
	className = '',
}) => {
	const t = useTranslations('account')
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [localPreview, setLocalPreview] = useState<string | null>(null)

	const uploadOptions: UploadToS3Options = {
		onSuccess: (fileUrl, fileKey) => {
			setLocalPreview(null)
			onUploadSuccess?.(fileUrl, fileKey)
		},
		onError: error => {
			setLocalPreview(null)
			onUploadError?.(error)
		},
	}

	const { uploadFile, isUploading, progress, error } =
		useUploadToS3(uploadOptions)

	const handleFileSelect = useCallback(
		async (file: File) => {
			if (file.size / (1024 * 1024) > maxSizeMB) {
				onUploadError?.(new Error(`File size exceeds ${maxSizeMB}MB limit`))
				return
			}
			if (!file.type.startsWith('image/')) {
				onUploadError?.(new Error('Please select an image file'))
				return
			}

			// Show a data-URL preview immediately while the upload is in progress
			const reader = new FileReader()
			reader.onloadend = () => setLocalPreview(reader.result as string)
			reader.readAsDataURL(file)

			try {
				const fileToUpload = compressBeforeUpload
					? await compressImage(file)
					: file
				const presignOptions: Partial<PresignRequest> = {
					folder,
					expiresIn: 3600,
				}
				await uploadFile(fileToUpload, presignOptions)
			} catch {
				// Errors are forwarded via the onError callback above
			}
		},
		[uploadFile, folder, maxSizeMB, onUploadError, compressBeforeUpload]
	)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) handleFileSelect(file)
		if (fileInputRef.current) fileInputRef.current.value = ''
	}

	const handleClick = () => {
		if (uploadable && !isUploading) fileInputRef.current?.click()
	}

	const displayName =
		account.fursona_name ||
		account.first_name ||
		account.email?.charAt(0) ||
		'U'
	const initial = displayName.charAt(0).toUpperCase()
	const altText =
		account.fursona_name || account.first_name || t('avatarFallback')

	// localPreview takes priority so the UI feels instant, then falls back to
	// account.avatar (handled by S3Image which converts S3 URLs automatically).
	const avatarSrc = localPreview ?? account.avatar ?? null

	const cameraSize = Math.round(size * 0.28)
	const fontSize = Math.round(size * 0.3)

	return (
		<div
			className={`relative rounded-full overflow-hidden border-2 border-text-primary/40 bg-text flex-shrink-0 ${
				uploadable ? 'group cursor-pointer' : ''
			} ${className}`}
			style={{ width: size, height: size }}
			onClick={handleClick}
			role={uploadable ? 'button' : undefined}
			tabIndex={uploadable ? 0 : undefined}
			onKeyDown={
				uploadable
					? e => {
							if (e.key === 'Enter' || e.key === ' ') handleClick()
						}
					: undefined
			}
			aria-label={uploadable ? t('avatarFallback') : undefined}
		>
			{/* Hidden file input – only rendered when upload is enabled */}
			{uploadable && (
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					onChange={handleInputChange}
					disabled={isUploading}
					className='hidden'
				/>
			)}

			{/* Avatar: local preview blob → account.avatar (via S3Image) → initials */}
			{avatarSrc ? (
				<S3Image src={avatarSrc} alt={altText} fill className='object-cover' />
			) : (
				<div
					className='w-full h-full flex items-center justify-center text-[#48715B] font-bold'
					style={{ fontSize }}
				>
					{initial}
				</div>
			)}

			{/* Upload overlay – only shown when uploadable */}
			{uploadable && (
				<div
					className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-200 ${
						isUploading
							? 'bg-black/50'
							: 'bg-black/0 opacity-0 group-hover:bg-black/40 group-hover:opacity-100'
					}`}
				>
					{isUploading ? (
						<>
							<Loader2
								className='animate-spin text-white'
								style={{ width: cameraSize, height: cameraSize }}
							/>
							<span
								className='text-white font-semibold mt-1 leading-none select-none'
								style={{ fontSize: Math.round(size * 0.1) }}
							>
								{Math.round(progress)}%
							</span>
						</>
					) : error ? (
						<AlertCircle
							className='text-red-400'
							style={{ width: cameraSize, height: cameraSize }}
						/>
					) : onRemove && avatarSrc ? (
						/* Both replace (camera) and remove (trash) actions */
						<div className='flex items-center gap-2'>
							<Camera
								className='text-white drop-shadow'
								style={{ width: cameraSize * 0.8, height: cameraSize * 0.8 }}
							/>
							<div>|</div>
							<button
								type='button'
								onClick={e => {
									e.stopPropagation()
									setLocalPreview(null)
									onRemove()
								}}
								className='focus:outline-none cursor-pointer'
								aria-label='Remove avatar'
							>
								<Trash2
									className='text-red-400 drop-shadow'
									style={{ width: cameraSize * 0.8, height: cameraSize * 0.8 }}
								/>
							</button>
						</div>
					) : (
						<Camera
							className='text-white drop-shadow'
							style={{ width: cameraSize, height: cameraSize }}
						/>
					)}
				</div>
			)}
		</div>
	)
}

export default UserAvatar
