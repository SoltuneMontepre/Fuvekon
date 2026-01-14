'use client'

import { Toaster } from 'sonner'

const ToastProvider = () => {
	return (
		<Toaster
			position='top-right'
			expand={false}
			richColors
			closeButton
			duration={4000}
			toastOptions={{
				style: {
					background: '#fff',
					color: '#154c5b',
					border: '2px solid #548780',
					borderRadius: '12px',
					padding: '16px',
					fontSize: '14px',
					fontWeight: '500',
				},
				className: 'sonner-toast',
			}}
		/>
	)
}

export default ToastProvider
