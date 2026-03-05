'use client'

import React, { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Upload, X, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react'
import {
	useUploadToS3,
	type UploadToS3Options,
} from '@/hooks/services/s3/useUploadToS3'
import type { PresignRequest } from '@/types/api/s3/presign'
import { getS3ProxyUrl, isS3Url } from '@/utils/s3'
import { compressImage } from '@/utils/imageCompression'

export interface ImageUploaderProps {
	/** Callback when upload succeeds */
	onUploadSuccess?: (fileUrl: string, fileKey: string) => void
	/** Callback when upload fails */
	onUploadError?: (error: Error) => void
	/** Callback when user removes the image */
	onRemove?: () => void
	/** Optional folder path in S3 */
	folder?: string
	/** Optional expiration time in seconds */
	expiresIn?: number
	/** Maximum file size in MB */
	maxSizeMB?: number
	/** Accepted file types (e.g., 'image/*', 'image/png,image/jpeg') */
	accept?: string
	/** Initial image URL to display */
	initialImageUrl?: string
	/** Whether to show the preview */
	showPreview?: boolean
	/** Custom className for the container */
	className?: string
	/** Whether the uploader is disabled */
	disabled?: boolean
	/** Custom label text */
	label?: string
	/** Custom button text */
	buttonText?: string
	/** Compress image before upload (e.g. for avatars). Default false (e.g. price sheets stay full quality). */
	compressImage?: boolean
}

const ImageUploader: React.FC<ImageUploaderProps> = props => {
	const {
		onUploadSuccess,
		onUploadError,
		onRemove,
		folder,
		expiresIn = 3600,
		maxSizeMB = 10,
		accept = 'image/*',
		initialImageUrl,
		showPreview = true,
		className = '',
		disabled = false,
		label,
		buttonText,
		compressImage: compressImageBeforeUpload = false,
	} = props

	const tCommon = useTranslations('common')

	const resolvedLabel = label ?? tCommon('imageUploader.label')
	const resolvedButtonText =
		buttonText ?? tCommon('imageUploader.button.chooseFile')
	const fileInputRef = useRef<HTMLInputElement>(null)
	// Convert initial S3 URL to proxy URL if needed
	const getInitialDisplayUrl = (
		url: string | null | undefined
	): string | null => {
		if (!url) return null
		return isS3Url(url) ? getS3ProxyUrl(url) : url
	}
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		getInitialDisplayUrl(initialImageUrl)
	)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [uploadError, setUploadError] = useState<string | null>(null)

	const uploadOptions: UploadToS3Options = {
		onSuccess: (fileUrl, fileKey) => {
			setUploadError(null)
			// Convert S3 URL to proxy URL for Next.js Image optimization
			const displayUrl = isS3Url(fileUrl) ? getS3ProxyUrl(fileUrl) : fileUrl
			setPreviewUrl(displayUrl)
			onUploadSuccess?.(fileUrl, fileKey)
		},
		onError: error => {
			setUploadError(error.message)
			onUploadError?.(error)
		},
	}

	const { uploadFile, isUploading, progress, error } =
		useUploadToS3(uploadOptions)

	const isImageUrl = (url: string) => {
		const cleanUrl = url.split('?')[0].toLowerCase()
		return ['.jpg', '.jpeg', '.png'].some(
			ext => cleanUrl.endsWith(ext)
		)
	}

	const getFileNameFromUrl = (url: string) => {
		try {
			const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
			const lastPart = parsed.pathname.split('/').pop() || ''
			return decodeURIComponent(lastPart)
		} catch {
			return tCommon('imageUploader.status.uploadSuccessful')
		}
	}

	const isImagePreview = selectedFile
		? selectedFile.type.startsWith('image/')
		: previewUrl
			? isImageUrl(previewUrl)
			: false

	const isDocumentPreview =
		showPreview && (Boolean(selectedFile) || Boolean(previewUrl)) && !isImagePreview

	const previewFileName = selectedFile?.name ?? (previewUrl ? getFileNameFromUrl(previewUrl) : '')

	const isAcceptedFileType = (file: File, acceptPattern: string) => {
		const patterns = acceptPattern
			.split(',')
			.map(pattern => pattern.trim())
			.filter(Boolean)

		if (patterns.length === 0) return true

		return patterns.some(pattern => {
			if (pattern === '*/*') return true
			if (pattern.endsWith('/*')) {
				const mimePrefix = pattern.slice(0, -1)
				return file.type.startsWith(mimePrefix)
			}
			if (pattern.startsWith('.')) {
				return file.name.toLowerCase().endsWith(pattern.toLowerCase())
			}
			return file.type === pattern
		})
	}

	const handleFileSelect = useCallback(
		async (file: File) => {
			// Validate file size
			const fileSizeMB = file.size / (1024 * 1024)
			if (fileSizeMB > maxSizeMB) {
				const errorMsg = tCommon('imageUploader.validation.fileTooLarge', {
					maxSizeMB,
				})
				setUploadError(errorMsg)
				onUploadError?.(new Error(errorMsg))
				return
			}

			if (!isAcceptedFileType(file, accept)) {
				const errorMsg = accept.includes('image')
					? tCommon('imageUploader.validation.invalidType')
					: tCommon('imageUploader.validation.invalidFileType')
				setUploadError(errorMsg)
				onUploadError?.(new Error(errorMsg))
				return
			}

			setSelectedFile(file)
			setUploadError(null)

			// Create preview
			if (showPreview && file.type.startsWith('image/')) {
				const reader = new FileReader()
				reader.onloadend = () => {
					setPreviewUrl(reader.result as string)
				}
				reader.readAsDataURL(file)
			} else {
				setPreviewUrl(null)
			}

			// Upload file (compress first when requested, e.g. user profile avatar)
			try {
				const fileToUpload =
					compressImageBeforeUpload && file.type.startsWith('image/')
						? await compressImage(file)
						: file
				const presignOptions: Partial<PresignRequest> = {
					folder,
					expiresIn,
				}
				await uploadFile(fileToUpload, presignOptions)
			} catch {
				// Error is already handled by the hook's onError callback
			}
		},
		[
			uploadFile,
			folder,
			expiresIn,
			accept,
			maxSizeMB,
			showPreview,
			onUploadError,
			compressImageBeforeUpload,
			tCommon,
		]
	)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			handleFileSelect(file)
		}
		// Reset input so the same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleRemove = () => {
		setPreviewUrl(null)
		setSelectedFile(null)
		setUploadError(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
		onRemove?.()
	}

	const handleClick = () => {
		if (!disabled && !isUploading) {
			fileInputRef.current?.click()
		}
	}

	return (
		<div className={`${className}`}>
			{/* Label */}
			{resolvedLabel && (
				<label className='block text-sm font-medium text-[#48715B]'>
					{resolvedLabel}
				</label>
			)}

			{/* Upload Area */}
			<div className='relative'>
				{/* File Input (hidden) */}
				<input
					ref={fileInputRef}
					type='file'
					accept={accept}
					onChange={handleInputChange}
					disabled={disabled || isUploading}
					className='hidden'
				/>

				{/* Preview or Upload Button */}
				{showPreview && previewUrl && isImagePreview ? (
					<div className='relative group'>
						<div className='relative rounded-xl overflow-hidden border-2 border-[#48715B]/30 bg-[#E2EEE2]'>
							<Image
								src={previewUrl}
								alt='Preview'
								fill
								className='object-contain'
								sizes=''
								unoptimized={previewUrl?.startsWith('/api/s3/image')}
							/>
							{/* Overlay with actions */}
							<div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100'>
								<div className='flex gap-2'>
									{!disabled && !isUploading && (
										<>
											<button
												type='button'
												onClick={handleClick}
												disabled={disabled || isUploading}
												className='shadow-md py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
											>
												<Upload className='w-4 h-4' />
												{tCommon('imageUploader.actions.replace')}
											</button>
											<button
												type='button'
												onClick={handleRemove}
												disabled={disabled || isUploading}
												className='shadow-md py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
											>
												<X className='w-4 h-4' />
												{tCommon('imageUploader.actions.remove')}
											</button>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Upload Status */}
						{isUploading && (
							<div className='absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg flex items-center gap-2'>
								<Loader2 className='w-4 h-4 animate-spin text-[#48715B]' />
								<span className='text-sm text-[#48715B] font-medium'>
									{Math.round(progress)}%
								</span>
							</div>
						)}

						{error && (
							<div className='absolute top-2 right-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 shadow-lg flex items-center gap-2'>
								<AlertCircle className='w-4 h-4 text-red-600' />
								<span className='text-sm text-red-600 font-medium'>
									{tCommon('imageUploader.status.error')}
								</span>
							</div>
						)}
					</div>
				) : isDocumentPreview ? (
					<div className='relative group'>
						<div className='rounded-xl border-2 border-[#48715B]/30 bg-[#E2EEE2] p-6 flex flex-col items-center justify-center gap-3 text-center'>
							<FileText className='w-12 h-12 text-[#48715B]' />
							<p className='text-sm font-medium text-[#48715B] break-all max-w-full'>
								{previewFileName || 'Document uploaded'}
							</p>
						</div>
						<div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100'>
							<div className='flex gap-2'>
								{!disabled && !isUploading && (
									<>
										<button
											type='button'
											onClick={handleClick}
											disabled={disabled || isUploading}
											className='shadow-md py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
										>
											<Upload className='w-4 h-4' />
											{tCommon('imageUploader.actions.replace')}
										</button>
										<button
											type='button'
											onClick={handleRemove}
											disabled={disabled || isUploading}
											className='shadow-md py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
										>
											<X className='w-4 h-4' />
											{tCommon('imageUploader.actions.remove')}
										</button>
									</>
								)}
							</div>
						</div>
					</div>
				) : !showPreview && (previewUrl || initialImageUrl) ? (
					/* Action Buttons when preview is hidden but image exists */
					<div className='flex flex-col items-center gap-4'>
						{isUploading && (
							<div className='bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg flex items-center gap-2'>
								<Loader2 className='w-4 h-4 animate-spin text-[#48715B]' />
								<span className='text-sm text-[#48715B] font-medium'>
									{tCommon('imageUploader.status.uploading', {
										progress: Math.round(progress),
									})}
								</span>
							</div>
						)}
						{error && (
							<div className='bg-red-50 border border-red-200 rounded-lg px-3 py-2 shadow-lg flex items-center gap-2'>
								<AlertCircle className='w-4 h-4 text-red-600' />
								<span className='text-sm text-red-600 font-medium'>
									{tCommon('imageUploader.status.error')}
								</span>
							</div>
						)}
						{!disabled && !isUploading && (
							<div className='flex gap-2'>
								<button
									type='button'
									onClick={handleClick}
									disabled={disabled || isUploading}
									className='shadow-md py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
								>
									<Upload className='w-4 h-4' />
									{tCommon('imageUploader.actions.replace')}
								</button>
								<button
									type='button'
									onClick={handleRemove}
									disabled={disabled || isUploading}
									className='shadow-md py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
								>
									<X className='w-4 h-4' />
									{tCommon('imageUploader.actions.remove')}
								</button>
							</div>
						)}
					</div>
				) : (
					<div
						onClick={handleClick}
						className={`
							relative w-full h-32 rounded-xl border-2 border-dashed 
							${
								disabled || isUploading
									? 'border-[#8C8C8C]/30 bg-[#E2EEE2]/50 cursor-not-allowed'
									: 'border-[#48715B]/50 bg-[#E2EEE2] hover:border-[#48715B] hover:bg-[#E2EEE2]/80 cursor-pointer transition-all duration-200'
							}
							flex flex-col items-center justify-center gap-4
						`}
					>
						{isUploading ? (
							<>
								<Loader2 className='w-10 h-10 text-[#48715B] animate-spin' />
								<div className='text-center'>
									<p className='text-[#48715B] font-medium'>
										{tCommon('imageUploader.status.uploading', {
											progress: Math.round(progress),
										})}
									</p>
									<div className='mt-2 w-48 h-2 bg-[#8C8C8C]/20 rounded-full overflow-hidden'>
										<div
											className='h-full bg-[#48715B] transition-all duration-300'
											style={{ width: `${progress}%` }}
										/>
									</div>
								</div>
							</>
						) : (
							<>
								<Upload className='w-12 h-12 text-[#48715B]' />
								<div className='text-center'>
									<p className='text-[#48715B] font-medium'>
										{resolvedButtonText}
									</p>
									<p className='text-sm text-[#8C8C8C] mt-1'>
										{tCommon('imageUploader.hint.maxSize', { maxSizeMB })}
									</p>
								</div>
							</>
						)}
					</div>
				)}

				{/* Error Message */}
				{(uploadError || error) && (
					<div className='mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5'>
						<AlertCircle className='w-4 h-4 flex-shrink-0' />
						<span>
							{uploadError ||
								error?.message ||
								tCommon('imageUploader.status.uploadFailed')}
						</span>
					</div>
				)}

				{/* Success Message */}
				{!isUploading && !error && previewUrl && selectedFile && (
					<div className='mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2.5'>
						<CheckCircle2 className='w-4 h-4 flex-shrink-0' />
						<span>{tCommon('imageUploader.status.uploadSuccessful')}</span>
					</div>
				)}
			</div>
		</div>
	)
}

export default ImageUploader
