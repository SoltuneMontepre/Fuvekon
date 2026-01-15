'use client'

import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { logger } from '@/utils/logger'

const Loading = (): React.ReactElement => {
	useEffect(() => {
		logger.debug('Loading component mounted')
		const startTime = Date.now()

		return () => {
			const duration = Date.now() - startTime
			logger.debug('Loading component unmounted', { durationMs: duration })
		}
	}, [])

	return (
		<div
			className='fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50'
			role='status'
			aria-live='polite'
		>
			<div className='flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-black/70 rounded-lg shadow'>
				<Loader2
					className='animate-spin h-6 w-6 text-sky-600'
					aria-hidden='true'
				/>
				<span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
					Loading...
				</span>
			</div>
		</div>
	)
}

export default Loading
