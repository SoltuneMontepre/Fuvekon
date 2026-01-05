function sanitizeFileName(fileName: string): string {
	return fileName
		.replace(/[\/\\]/g, '')
		.replace(/^\.+/, '')
		.replace(/[^a-zA-Z0-9.-]/g, '_')
}

export function generateFileKey(fileName: string, folder?: string): string {
	const timestamp = Date.now()
	const randomString = Math.random().toString(36).substring(2, 15)
	const sanitizedFileName = sanitizeFileName(fileName)

	return folder
		? `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`
		: `${timestamp}-${randomString}-${sanitizedFileName}`
}
