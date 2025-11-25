function validateAndDecodeKey(key: string | string[] | null | undefined): {
	isValid: boolean
	decodedKey?: string
	error?: string
} {
	if (!key || (typeof key === 'string' && key.trim().length === 0)) {
		return { isValid: false, error: 'Missing key parameter' }
	}

	// Handle array case (shouldn't happen, but be safe)
	const keyStr = Array.isArray(key) ? key[0] : key

	// Decode the key (handle multiple encodings)
	let decodedKey = keyStr
	try {
		// Decode up to 3 times to handle multiple encodings
		for (let i = 0; i < 3; i++) {
			const prevKey = decodedKey
			decodedKey = decodeURIComponent(decodedKey)
			if (prevKey === decodedKey) break
		}
	} catch {
		decodedKey = keyStr
	}

	if (decodedKey.includes('..') || decodedKey.startsWith('/')) {
		return {
			isValid: false,
			error: 'Invalid key format: path traversal detected',
		}
	}

	if (Buffer.byteLength(decodedKey, 'utf8') > 1024) {
		return {
			isValid: false,
			error: 'Key exceeds maximum length',
		}
	}

	return { isValid: true, decodedKey }
}

export { validateAndDecodeKey }
