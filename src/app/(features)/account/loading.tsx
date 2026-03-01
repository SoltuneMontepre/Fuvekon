import { Loader2 } from 'lucide-react'

export default function AccountLoading() {
	return (
		<div
			className='flex min-h-[320px] items-center justify-center py-12'
			role='status'
			aria-live='polite'
		>
			<div className='flex items-center gap-3 px-6 py-3 rounded-lg'>
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
