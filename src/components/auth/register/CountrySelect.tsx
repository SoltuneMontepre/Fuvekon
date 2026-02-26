'use client'

import React, { useMemo } from 'react'
import {
	useController,
	type Control,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'
import { getNames } from 'country-list'
import { FORM_STYLES } from './RegisterForm.styles'

interface CountrySelectProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
	id: string
	name: TName
	control: Control<TFieldValues>
	label: string
	placeholder: string
	required?: boolean
	showError?: boolean
}

export const CountrySelect = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
	id,
	name,
	control,
	label,
	placeholder,
	required = false,
	showError = true,
}: CountrySelectProps<TFieldValues, TName>) => {
	const {
		field,
		fieldState: { error },
	} = useController({
		name,
		control,
		rules: { required },
	})

	const countries = useMemo(() => {
		try {
			return getNames().sort()
		} catch {
			return []
		}
	}, [])

	const selectClasses = `${FORM_STYLES.input.base} ${
		error ? FORM_STYLES.input.error : FORM_STYLES.input.default
	} appearance-none cursor-pointer`

	// Always show floating label for selects since placeholder behaves differently
	const labelClasses = `${FORM_STYLES.label.base} ${FORM_STYLES.label.floating}`

	return (
		<div className='w-full'>
			<div className='relative w-full'>
				<select
					id={id}
					{...field}
					className={`${selectClasses} w-full`}
					required={required}
					aria-invalid={!!error}
					aria-describedby={error ? `${id}-error` : undefined}
				>
					<option value='' disabled hidden>
						{placeholder}
					</option>
					{countries.map(country => (
						<option key={country} value={country}>
							{country}
						</option>
					))}
				</select>
			</div>
			<label
				htmlFor={id}
				className={labelClasses}
				style={{ transformOrigin: 'left' }}
			>
				{label}
			</label>
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
