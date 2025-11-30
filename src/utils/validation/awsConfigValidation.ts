function validateAwsConfig(): { isValid: boolean; error?: string } {
	const NLF_AWS_REGION = process.env.NLF_AWS_REGION
	const NLF_AWS_ACCESS_KEY_ID = process.env.NLF_AWS_ACCESS_KEY_ID
	const NLF_AWS_SECRET_ACCESS_KEY = process.env.NLF_AWS_SECRET_ACCESS_KEY
	const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

	const missing: string[] = []

	if (!BUCKET_NAME) missing.push('AWS_S3_BUCKET_NAME')
	if (!NLF_AWS_ACCESS_KEY_ID) missing.push('NLF_AWS_ACCESS_KEY_ID')
	if (!NLF_AWS_SECRET_ACCESS_KEY) missing.push('NLF_AWS_SECRET_ACCESS_KEY')
	if (!NLF_AWS_REGION) missing.push('NLF_AWS_REGION')

	if (missing.length > 0) {
		return {
			isValid: false,
			error: `Missing required environment variables: ${missing.join(', ')}`,
		}
	}

	return { isValid: true }
}

export { validateAwsConfig }
