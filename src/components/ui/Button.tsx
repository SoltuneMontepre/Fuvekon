import React from 'react'

const Button = ({
	children,
	className,
	props,
}: {
	children: React.ReactNode
	className?: string
	props?: React.ButtonHTMLAttributes<HTMLButtonElement>
}) => {
	return (
		<button
			className={`px-6 py-3 hover:bg-slate-900/20 text-slate-900 font-medium rounded-xl shadow-xl border  transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button
