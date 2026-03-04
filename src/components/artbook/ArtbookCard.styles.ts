/**
 * Reusable style constants for registration form components
 */

export const FORM_STYLES = {
	// Input field styles
	input: {
		base: 'block w-full px-2.5 py-1.5 sm:py-1.5 rounded-xl bg-[#E2EEE2] border text-[#8C8C8C] text-sm sm:text-base font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer transition-colors duration-200',
		default: 'border-[#8C8C8C]/30',
		error: 'border-red-500',
		withIcon: 'pr-10',
	},

	// Label styles
	label: {
		base: 'absolute left-3 top-2 sm:top-2 text-sm sm:text-base font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none',
		floating: 'scale-75 -translate-y-7 sm:-translate-y-8',
		focused:
			'peer-focus:scale-75 peer-focus:-translate-y-7 sm:peer-focus:-translate-y-8',
	},

	// Button styles
	button: {
		primary:
			'cursor-pointer block mx-auto w-full -mt-4 max-w-[360px] sm:w-[360px] py-2 sm:py-3 rounded-xl text-[#48715B] font-semibold text-sm sm:text-base hover:bg-[#48715B]/90 hover:text-[#E2EEE2] active:bg-[#48715B]/80 focus:outline-none focus:ring-4 focus:ring-[#48715B]/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
		disabled: 'opacity-50 cursor-not-allowed',
		icon: 'absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] hover:text-[#48715B] transition-colors duration-200 focus:outline-none',
	},

	// Container styles
	container: {
		wrapper:
			'relative mt-24 sm:pt-20 md:pt-36 w-full max-w-5xl min-h-[790px] h-auto',
		panel:
			'relative bg-[#E2EEE2] translate-y-0 rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[850px] h-auto items-center justify-center md:justify-starttar',
		background:
			'absolute inset-0 w-full h-full z-10 pointer-events-none select-none hidden md:block overflow-hidden',
		formPanel:
			'relative md:absolute md:top-0 md:right-0 md:bottom-0 md:my-auto w-full md:w-1/2 p-4 sm:p-6 md:p-5 flex flex-col justify-center z-40 rounded-2xl md:rounded-[32px] bg-[#E2EEE2] md:shadow-2xl',
		formContent: 'space-y-3 sm:space-y-4',
		inputWrapper: 'relative w-full max-w-[360px] sm:w-96 mx-auto',
	},
} as const

/**
 * Static inline styles (for transform-origin, etc.)
 */
export const INLINE_STYLES = {
	labelTransform: { transformOrigin: 'left' as const },
} as const
