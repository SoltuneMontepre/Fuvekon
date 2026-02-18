import imageCompression from 'browser-image-compression'

export interface CompressImageOptions {
	/** Max file size in MB (default: 1) */
	maxSizeMB?: number
	/** Max width or height in pixels (default: 1920) */
	maxWidthOrHeight?: number
	/** Use web worker to avoid blocking UI (default: true) */
	useWebWorker?: boolean
	/** Initial quality 0–1 for JPEG/WebP (default: library default) */
	initialQuality?: number
}

const DEFAULT_OPTIONS: CompressImageOptions = {
	maxSizeMB: 2,
	maxWidthOrHeight: 1920,
	useWebWorker: true,
}

/**
 * Compresses an image file for upload. Returns the original file if it's not
 * an image or if compression fails (e.g. in Node/SSR).
 */
export async function compressImage(
	file: File,
	options: CompressImageOptions = {}
): Promise<File> {
	if (!file.type.startsWith('image/')) {
		return file
	}

	// Skip in non-browser (e.g. SSR / Node)
	if (typeof window === 'undefined') {
		return file
	}

	try {
		const opts = { ...DEFAULT_OPTIONS, ...options }
		const compressed = await imageCompression(file, {
			maxSizeMB: opts.maxSizeMB,
			maxWidthOrHeight: opts.maxWidthOrHeight,
			useWebWorker: opts.useWebWorker,
			...(opts.initialQuality != null && {
				initialQuality: opts.initialQuality,
			}),
		})
		// Preserve original name so S3 key / filename stay consistent
		return compressed.name !== file.name
			? new File([compressed], file.name, { type: compressed.type })
			: compressed
	} catch {
		return file
	}
}
