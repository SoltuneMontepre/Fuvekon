function validateAwsConfig(): { isValid: boolean; error?: string } {
	const AWS_REGION = process.env.AWS_REGION
	const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
	const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
	const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

	const missing: string[] = []

	if (!BUCKET_NAME) missing.push('AWS_S3_BUCKET_NAME')
	if (!AWS_ACCESS_KEY_ID) missing.push('AWS_ACCESS_KEY_ID')
	if (!AWS_SECRET_ACCESS_KEY) missing.push('AWS_SECRET_ACCESS_KEY')
	if (!AWS_REGION) missing.push('AWS_REGION')

	if (missing.length > 0) {
		return {
			isValid: false,
			error: `Missing required environment variables: ${missing.join(', ')}`,
		}
	}

	return { isValid: true }
}

export { validateAwsConfig }
