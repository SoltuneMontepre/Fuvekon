import React from 'react'

interface ValidationSpeechBubbleProps {
	errors: Record<string, string | undefined>
}

/**
 * Speech bubble component that displays validation errors as if the character is speaking
 */
export const ValidationSpeechBubble: React.FC<ValidationSpeechBubbleProps> = ({
	errors,
}) => {
	// Get all error messages
	const errorMessages = Object.values(errors).filter(
		(msg): msg is string => !!msg
	)

	// Don't render if no errors
	if (errorMessages.length === 0) return null

	return (
		<div className='absolute left-4 md:left-[-10%] top-[10%] md:top-[23%] z-[100] hidden md:block max-w-[280px]'>
			{/* Speech bubble */}
			<div className='relative bg-white rounded-2xl shadow-2xl p-4 border-2 border-[#48715B]'>
				{/* Bubble content */}
				<div className='space-y-2'>
					{errorMessages.map((message, index) => (
						<p
							key={index}
							className='text-sm text-[#48715B] font-medium leading-relaxed'
						>
							• {message}
						</p>
					))}
				</div>

				{/* Triangle pointer pointing to the character */}
				<div className='absolute right-[-11px] top-[70%]'>
					<div className='w-0 h-0 border-t-[12px] border-t-transparent border-l-[12px] border-l-[#48715B] border-b-[12px] border-b-transparent' />
					<div className='absolute right-[2px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-l-[10px] border-l-white border-b-[10px] border-b-transparent' />
				</div>
			</div>

			{/* Animation */}
			<style jsx>{`
				@keyframes bubble-appear {
					from {
						opacity: 0;
						transform: scale(0.8);
					}
					to {
						opacity: 1;
						transform: scale(1);
					}
				}
				div {
					animation: bubble-appear 0.3s ease-out;
				}
			`}</style>
		</div>
	)
}
