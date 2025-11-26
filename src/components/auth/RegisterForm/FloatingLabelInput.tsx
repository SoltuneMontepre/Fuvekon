import React, { useState } from 'react'
import { FORM_STYLES, INLINE_STYLES } from './RegisterForm.styles'
import { PasswordToggleButton } from './PasswordToggleButton'

interface FloatingLabelInputProps {
	id: string
	type: 'text' | 'email' | 'password'
	value: string
	onChange: (value: string) => void
	label: string
	placeholder: string
	required?: boolean
	error?: string
	showPasswordToggle?: boolean
	onBlur?: () => void
}

/**
 * Reusable floating label input component
 * Eliminates 400+ lines of duplication across form fields
 */
export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
	id,
	type,
	value,
	onChange,
	label,
	placeholder,
	required = false,
	error,
	showPasswordToggle = false,
	onBlur,
}) => {
	const [showPassword, setShowPassword] = useState(false)

	const inputType =
		showPasswordToggle && type === 'password'
			? showPassword
				? 'text'
				: 'password'
			: type

	const inputClasses = `${FORM_STYLES.input.base} ${error ? FORM_STYLES.input.error : FORM_STYLES.input.default} ${showPasswordToggle ? FORM_STYLES.input.withIcon : ''}`

	const labelClasses = `${FORM_STYLES.label.base} ${value ? FORM_STYLES.label.floating : FORM_STYLES.label.focused}`

	return (
		<div className={FORM_STYLES.container.inputWrapper}>
			<input
				id={id}
				type={inputType}
				value={value}
				onChange={e => onChange(e.target.value)}
				onBlur={onBlur}
				className={inputClasses}
				placeholder={placeholder}
				required={required}
				aria-invalid={!!error}
				aria-describedby={error ? `${id}-error` : undefined}
			/>
			<label htmlFor={id} className={labelClasses} style={INLINE_STYLES.labelTransform}>
				{label}
			</label>
			{showPasswordToggle && (
				<PasswordToggleButton
					show={showPassword}
					onToggle={() => setShowPassword(!showPassword)}
				/>
			)}
			{error && (
				<p id={`${id}-error`} className={FORM_STYLES.error.fieldError} role='alert'>
					{error}
				</p>
			)}
		</div>
	)
}
