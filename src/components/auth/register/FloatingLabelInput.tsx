import React, { useState } from 'react'
import {
	useController,
	type Control,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'
import { PasswordToggleButton } from './PasswordToggleButton'
import { FORM_STYLES, INLINE_STYLES } from './RegisterForm.styles'

interface FloatingLabelInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
	id: string
	name: TName
	control: Control<TFieldValues>
	type: 'text' | 'email' | 'password' | 'date' | 'tel'
	label: string
	placeholder: string
	required?: boolean
	showPasswordToggle?: boolean
	showError?: boolean
	disabled?: boolean
}

/**
 * Reusable floating label input component with react-hook-form integration
 * Eliminates 400+ lines of duplication across form fields
 */
export const FloatingLabelInput = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
	id,
	name,
	control,
	type,
	label,
	placeholder,
	required = false,
	showPasswordToggle = false,
	showError = true,
	disabled = false,
}: FloatingLabelInputProps<TFieldValues, TName>) => {
	const [showPassword, setShowPassword] = useState(false)

	const {
		field,
		fieldState: { error },
	} = useController({
		name,
		control,
		rules: { required },
	})

	const inputType =
		showPasswordToggle && type === 'password'
			? showPassword
				? 'text'
				: 'password'
			: type

	const inputClasses = `${FORM_STYLES.input.base} ${
		error ? FORM_STYLES.input.error : FORM_STYLES.input.default
	} ${showPasswordToggle ? FORM_STYLES.input.withIcon : ''}`

	// For date inputs, always show floating label since they don't work well with placeholder
	const shouldFloat = field.value || type === 'date'
	const labelClasses = `${FORM_STYLES.label.base} ${
		shouldFloat ? FORM_STYLES.label.floating : FORM_STYLES.label.focused
	}`

	return (
		<div className={FORM_STYLES.container.inputWrapper}>
			<input
				id={id}
				type={inputType}
				{...field}
				className={inputClasses}
				placeholder={type !== 'date' ? placeholder : undefined}
				required={required}
				disabled={disabled}
				aria-invalid={!!error}
				aria-describedby={error ? `${id}-error` : undefined}
			/>
			<label
				htmlFor={id}
				className={labelClasses}
				style={INLINE_STYLES.labelTransform}
			>
				{label}
			</label>
			{showPasswordToggle && (
				<PasswordToggleButton
					show={showPassword}
					onToggle={() => setShowPassword(!showPassword)}
				/>
			)}
			{showError && error && (
				<p
					id={`${id}-error`}
					className={FORM_STYLES.error.fieldError}
					role='alert'
				>
					{error.message}
				</p>
			)}
		</div>
	)
}
