export function generateS3PublicUrl(
	bucketName: string,
	region: string,
	fileKey: string
): string {
	return `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`
}
