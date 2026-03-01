'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo } from 'react'
import {
	useController,
	type Control,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'
import { getNames, getCode, getName } from 'country-list'
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
		defaultValue: '' as any,
		rules: { required },
	})

	// build a list of country objects with name/code so we can
	// render the name but keep the value as ISO code. sorting by name
	const countryList = useMemo(() => {
		try {
			return getNames()
				.sort()
				.map(name => ({
					name,
					code: getCode(name) || '',
				}))
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
					name={field.name}
					value={(field.value as unknown as string) || ''}
					onChange={e =>
					field.onChange(
						e.target.value as any
					)
				}
					onBlur={field.onBlur}
					ref={field.ref}
					className={`${selectClasses} w-full`}
					aria-invalid={!!error}
					aria-describedby={error ? `${id}-error` : undefined}
				>
					<option value='' disabled hidden>
						{placeholder}
					</option>
					{countryList.map(({name, code}) => (
						<option key={code || name} value={code}>
							{name}
						</option>
					))}
					{field.value &&
						!countryList.some(c => c.code === field.value) && (
							<option value={field.value}>
								{getName(field.value) || field.value}
							</option>
						)}
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
