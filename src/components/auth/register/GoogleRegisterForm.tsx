'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { lockScroll } from '@/utils/scrollLock'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
	GoogleRegisterFormSchema,
	type GoogleRegisterFormData,
} from '@/types/api/auth/googleRegister'
import { FORM_STYLES } from './RegisterForm.styles'
import { FloatingLabelInput } from './FloatingLabelInput'
import { CountrySelect } from './CountrySelect'
import { sanitizeInput } from '@/utils/sanitization'
import {
	useGoogleRegister,
	getGoogleCredential,
	clearGoogleCredential,
} from '@/hooks/services/auth/useGoogleRegister'
import { useTranslations } from 'next-intl'

const GoogleRegisterForm = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('auth')
	const googleRegisterMutation = useGoogleRegister()

	const credential = getGoogleCredential()

	useEffect(() => {
		if (!credential) {
			router.replace('/register')
		}
	}, [credential, router])

	const getAuthErrorMessage = (
		errorMessage?: string,
		fallbackKey: string = 'registerFailed'
	): string => {
		if (errorMessage?.trim()) {
			try {
				const translated = t(errorMessage.trim())
				return translated !== errorMessage.trim() ? translated : t(fallbackKey)
			} catch {
				return t(fallbackKey)
			}
		}
		return t(fallbackKey)
	}

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		setError,
	} = useForm<GoogleRegisterFormData>({
		resolver: zodResolver(GoogleRegisterFormSchema),
		defaultValues: {
			fullName: '',
			nickname: '',
			dateOfBirth: '',
			country: '',
		},
	})

	useEffect(() => {
		const unlock = lockScroll()
		return () => {
			unlock()
		}
	}, [])

	const onSubmit = async (data: GoogleRegisterFormData) => {
		if (!credential) {
			router.replace('/register')
			return
		}

		try {
			const responseData = await googleRegisterMutation.mutateAsync({
				credential,
				fullName: sanitizeInput(data.fullName),
				nickname: sanitizeInput(data.nickname),
				dateOfBirth: data.dateOfBirth,
				country: sanitizeInput(data.country),
			})
			if (!responseData.isSuccess) {
				setError('root', {
					type: 'manual',
					message: getAuthErrorMessage(responseData.errorMessage),
				})
				return
			}
			router.push('/account')
		} catch (err) {
			const axiosData = (
				err as {
					response?: {
						data?: { errorMessage?: string }
					}
				}
			)?.response?.data
			setError('root', {
				type: 'manual',
				message: axiosData?.errorMessage
					? getAuthErrorMessage(axiosData.errorMessage)
					: t('registerFailed'),
			})
		}
	}

	if (!credential) {
		return <div />
	}

	return (
		<div className={`${FORM_STYLES.container.wrapper} relative`}>
			<div className={FORM_STYLES.container.panel}>
				<div className={FORM_STYLES.container.background}>
					<Image
						src='/images/landing/tranh full oc.webp'
						alt='Fantasy Character'
						fill
						className='object-cover object-[50%_15%] scale-y-150 scale-x-150 translate-x-[-450px] translate-y-[150px]'
						priority
					/>
				</div>
				<div className={FORM_STYLES.container.formPanel}>
					<div className={FORM_STYLES.container.formContent}>
						<h3 className={FORM_STYLES.form.title}>
							{t('completeRegistration')}
						</h3>

						<p className='text-[#8C8C8C] text-sm text-center -mt-2 mb-1'>
							{t('googleRegisterSubtitle')}
						</p>

						<form
							onSubmit={handleSubmit(onSubmit)}
							className={FORM_STYLES.form.wrapper}
						>
							{errors.root && (
								<div className={FORM_STYLES.error.message} role='alert'>
									{errors.root.message}
								</div>
							)}

							<FloatingLabelInput
								id='fullName'
								name='fullName'
								control={control}
								type='text'
								label={`${t('fullName')}:`}
								placeholder={t('fullName')}
								required
								translateError={t}
							/>

							<FloatingLabelInput
								id='nickname'
								name='nickname'
								control={control}
								type='text'
								label={`${t('nickname')}:`}
								placeholder={t('nickname')}
								required
								translateError={t}
							/>

							<FloatingLabelInput
								id='dateOfBirth'
								name='dateOfBirth'
								control={control}
								type='date'
								label={t('dateOfBirth')}
								placeholder={t('dateOfBirth')}
								required
								translateError={t}
							/>

							<div className={FORM_STYLES.container.inputWrapper}>
								<CountrySelect
									id='country'
									name='country'
									control={control}
									label={t('country')}
									placeholder={t('selectCountry')}
									required
									showError={false}
									translateError={t}
								/>
							</div>

							<button
								type='submit'
								disabled={isSubmitting || googleRegisterMutation.isPending}
								className={`${FORM_STYLES.button.primary} ${
									isSubmitting || googleRegisterMutation.isPending
										? FORM_STYLES.button.disabled
										: ''
								}`}
							>
								{isSubmitting || googleRegisterMutation.isPending
									? t('registering')
									: t('register')}
							</button>

							<div className={FORM_STYLES.link.container}>
								<Link
									href='/register'
									className={FORM_STYLES.link.base}
									onClick={() => clearGoogleCredential()}
								>
									{t('backToRegister')}
								</Link>
								<span className={FORM_STYLES.link.separator}>|</span>
								<Link
									href='/login'
									className={FORM_STYLES.link.base}
									onClick={() => clearGoogleCredential()}
								>
									{t('login')}
								</Link>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

export default GoogleRegisterForm
