'use client'

import React, { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import {
	useUploadToS3,
	type UploadToS3Options,
} from '@/hooks/services/s3/useUploadToS3'
import type { PresignRequest } from '@/types/api/s3/presign'
import { getS3ProxyUrl, isS3Url } from '@/utils/s3'

export interface ImageUploaderProps {
	/** Callback when upload succeeds */
	onUploadSuccess?: (fileUrl: string, fileKey: string) => void
	/** Callback when upload fails */
	onUploadError?: (error: Error) => void
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
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
	onUploadSuccess,
	onUploadError,
	folder,
	expiresIn = 3600,
	maxSizeMB = 10,
	accept = 'image/*',
	initialImageUrl,
	showPreview = true,
	className = '',
	disabled = false,
	label = 'Upload Image',
	buttonText = 'Choose File',
}) => {
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

	const handleFileSelect = useCallback(
		async (file: File) => {
			// Validate file size
			const fileSizeMB = file.size / (1024 * 1024)
			if (fileSizeMB > maxSizeMB) {
				const errorMsg = `File size exceeds ${maxSizeMB}MB limit`
				setUploadError(errorMsg)
				onUploadError?.(new Error(errorMsg))
				return
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				const errorMsg = 'Please select an image file'
				setUploadError(errorMsg)
				onUploadError?.(new Error(errorMsg))
				return
			}

			setSelectedFile(file)
			setUploadError(null)

			// Create preview
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string)
			}
			reader.readAsDataURL(file)

			// Upload file
			try {
				const presignOptions: Partial<PresignRequest> = {
					folder,
					expiresIn,
				}
				await uploadFile(file, presignOptions)
			} catch (err) {
				// Error is already handled by the hook's onError callback
				console.error('Upload error:', err)
			}
		},
		[uploadFile, folder, expiresIn, maxSizeMB, onUploadError]
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
		const url = initialImageUrl || null
		// Convert S3 URL to proxy URL if needed
		const displayUrl = url && isS3Url(url) ? getS3ProxyUrl(url) : url
		setPreviewUrl(displayUrl)
		setSelectedFile(null)
		setUploadError(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleClick = () => {
		if (!disabled && !isUploading) {
			fileInputRef.current?.click()
		}
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Label */}
			{label && (
				<label className='block text-sm font-medium text-[#48715B]'>
					{label}
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
				{showPreview && previewUrl ? (
					<div className='relative group'>
						<div className='relative w-full h-64 rounded-xl overflow-hidden border-2 border-[#48715B]/30 bg-[#E2EEE2]'>
							<Image
								src={previewUrl}
								alt='Preview'
								fill
								className='object-contain'
								sizes='(max-width: 768px) 100vw, 50vw'
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
												className='px-4 py-2 bg-[#48715B] text-white rounded-lg hover:bg-[#48715B]/90 transition-colors flex items-center gap-2'
											>
												<Upload className='w-4 h-4' />
												Replace
											</button>
											<button
												type='button'
												onClick={handleRemove}
												className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2'
											>
												<X className='w-4 h-4' />
												Remove
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
								<span className='text-sm text-red-600 font-medium'>Error</span>
							</div>
						)}
					</div>
				) : (
					<div
						onClick={handleClick}
						className={`
							relative w-full h-64 rounded-xl border-2 border-dashed 
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
								<Loader2 className='w-12 h-12 text-[#48715B] animate-spin' />
								<div className='text-center'>
									<p className='text-[#48715B] font-medium'>
										Uploading... {Math.round(progress)}%
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
									<p className='text-[#48715B] font-medium'>{buttonText}</p>
									<p className='text-sm text-[#8C8C8C] mt-1'>
										Max size: {maxSizeMB}MB
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
						<span>{uploadError || error?.message || 'Upload failed'}</span>
					</div>
				)}

				{/* Success Message */}
				{!isUploading && !error && previewUrl && selectedFile && (
					<div className='mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2.5'>
						<CheckCircle2 className='w-4 h-4 flex-shrink-0' />
						<span>Upload successful!</span>
					</div>
				)}
			</div>
		</div>
	)
}

export default ImageUploader
