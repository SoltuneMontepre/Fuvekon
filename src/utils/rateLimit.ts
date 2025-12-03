/**
 * Rate limiting utility for form submissions
 * Prevents brute force attacks and excessive API calls
 */

/**
 * Rate limiting constants
 */
export const MAX_ATTEMPTS = 5
export const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Rate limiting state (in-memory)
 * Note: This resets on page reload. For persistent rate limiting, consider using localStorage or backend validation.
 */
let attemptCount = 0
let lastAttemptTime = 0

/**
 * Check if rate limit is exceeded
 * @returns Object containing whether the action is allowed and optional wait time in minutes
 */
export const checkRateLimit = (): { allowed: boolean; waitTime?: number } => {
	const now = Date.now()
	const timeSinceLastAttempt = now - lastAttemptTime

	// Reset counter after lockout duration
	if (timeSinceLastAttempt > LOCKOUT_DURATION) {
		attemptCount = 0
	}

	if (attemptCount >= MAX_ATTEMPTS) {
		const remainingWait = LOCKOUT_DURATION - timeSinceLastAttempt
		if (remainingWait > 0) {
			return { allowed: false, waitTime: Math.ceil(remainingWait / 1000 / 60) }
		}
		attemptCount = 0 // Reset after lockout
	}

	return { allowed: true }
}

/**
 * Increment the attempt counter
 * Call this when an attempt is made (successful or not)
 */
export const incrementAttemptCount = (): void => {
	attemptCount++
	lastAttemptTime = Date.now()
}

/**
 * Reset the attempt counter
 * Call this on successful completion to allow future attempts
 */
export const resetAttemptCount = (): void => {
	attemptCount = 0
}

/**
 * Get current attempt count (for testing/debugging)
 */
export const getAttemptCount = (): number => attemptCount
