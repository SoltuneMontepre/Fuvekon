// src/utils/scrollLock.ts
// Utility for coordinated scroll locking with lock count

let lockCount = 0
let originalOverflow: string | null = null

export function lockScroll() {
	if (lockCount === 0) {
		originalOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
	}
	lockCount++
	// Return unlock function
	return function unlockScroll() {
		lockCount--
		if (lockCount === 0 && originalOverflow !== null) {
			document.body.style.overflow = originalOverflow
			originalOverflow = null
		}
	}
}
