import Image, { type ImageProps } from 'next/image'
import React from 'react'
import { getS3ProxyUrl, isS3Url } from '@/utils/s3'

/**
 * Props for S3Image component
 * Extends Next.js ImageProps with automatic S3 URL handling
 */
export interface S3ImageProps extends Omit<ImageProps, 'src'> {
	/** Image source URL - can be S3 URL or regular URL */
	src: string
	/** Fallback image URL if S3 image fails to load */
	fallbackSrc?: string
}

/**
 * S3Image - A wrapper around Next.js Image component that automatically handles S3 URLs
 *
 * This component automatically converts S3 URLs to proxy URLs and handles
 * optimization settings appropriately.
 *
 * @example
 * ```tsx
 * // S3 URL - automatically proxied
 * <S3Image
 *   src="https://bucket.s3.region.amazonaws.com/user-uploads/image.jpg"
 *   alt="User image"
 *   width={400}
 *   height={300}
 * />
 *
 * // Regular URL - works normally
 * <S3Image
 *   src="/images/logo.png"
 *   alt="Logo"
 *   width={200}
 *   height={200}
 * />
 *
 * // With fallback
 * <S3Image
 *   src={s3Url}
 *   fallbackSrc="/images/placeholder.png"
 *   alt="Image"
 *   fill
 * />
 * ```
 */
const S3Image: React.FC<S3ImageProps> = ({
	src,
	fallbackSrc,
	alt,
	className,
	...props
}) => {
	const [imageSrc, setImageSrc] = React.useState<string>(src)
	const [hasError, setHasError] = React.useState(false)

	// Check if the source is an S3 URL
	const isS3 = React.useMemo(() => isS3Url(src), [src])

	// Convert S3 URL to proxy URL
	const proxyUrl = React.useMemo(() => {
		if (isS3) {
			return getS3ProxyUrl(src)
		}
		return src
	}, [src, isS3])

	// Update image source when src prop changes
	React.useEffect(() => {
		setImageSrc(proxyUrl)
		setHasError(false)
	}, [proxyUrl])

	// Handle image load error
	const handleError = (
		event: React.SyntheticEvent<HTMLImageElement, Event>
	) => {
		if (!hasError && fallbackSrc) {
			setImageSrc(fallbackSrc)
			setHasError(true)
		}
		// Call user-provided onError handler if it exists
		if (props.onError) {
			props.onError(event)
		}
	}

	return (
		<Image
			{...props}
			src={imageSrc}
			alt={alt}
			className={className}
			unoptimized={isS3}
			onError={fallbackSrc || props.onError ? handleError : undefined}
		/>
	)
}

export default S3Image
