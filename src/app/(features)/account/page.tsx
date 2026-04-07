'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Pencil, ChevronDown, AlertCircle, Eye, EyeOff, Info } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
	useUpdateMe,
	useUpdateAvatar,
	useVerifyOtp,
	useResendOtp,
} from '@/hooks/services/auth/useAccount'
import { getNames, getCode, getName } from 'country-list'
import UserAvatar from '@/components/common/UserAvatar'

const COUNTRY_NAMES = () => getNames()

function maskIdCard(value: string | undefined): string | undefined {
	if (!value) return value
	const trimmed = value.trim()
	if (!trimmed) return undefined
	const last4 = trimmed.slice(-4)
	return `•••• ${last4}`
}

const InfoField = ({
	label,
	value,
	name,
	editable = false,
	onChange,
	emptyLabel = 'N/A',
	helpContent,
}: {
	label: string
	value: string | undefined
	name?: string
	editable?: boolean
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	emptyLabel?: string
	helpContent?: React.ReactNode
}) => {
	if (editable && name) {
		return (
			<div className='group relative space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 focus-within:border-[#48715B] transition-colors duration-200 cursor-text'>
				<div className='flex items-center justify-between gap-2'>
					<label
						htmlFor={`${name}-input`}
						className='text-sm font-medium text-[#48715B] pointer-events-none'
					>
						{label}
					</label>
				</div>
				<div className='flex items-center gap-2'>
					<input
						type='text'
						id={`${name}-input`}
						name={name}
						value={value || ''}
						onChange={onChange}
						className='block w-full bg-transparent text-lg text-text-secondary font-normal placeholder-[#8C8C8C]/40 focus:outline-none'
						placeholder={label}
					/>
					<Pencil className='w-3.5 h-3.5 text-[#8C8C8C]/50 flex-shrink-0' />
				</div>
			</div>
		)
	}
	return (
		<div className='relative space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
			<div className='flex items-center justify-between gap-2'>
				<label className='text-sm font-medium text-[#48715B]'>{label}</label>
				{helpContent ? (
					<div className='group relative flex items-center'>
						<button
							type='button'
							className='p-1 rounded-md text-[#48715B]/70 hover:text-[#48715B] hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#48715B]/30'
							aria-label={`${label} guidance`}
						>
							<Info className='w-4 h-4' />
						</button>
						<div className='pointer-events-auto absolute right-0 top-[calc(100%+8px)] z-50 hidden w-[360px] max-w-[calc(100vw-32px)] rounded-xl border border-[#8C8C8C]/20 bg-white px-4 py-3 text-sm leading-6 text-text-secondary shadow-lg group-hover:block group-focus-within:block'>
							{helpContent}
						</div>
					</div>
				) : null}
			</div>
			<div className='text-lg text-text-secondary'>{value || emptyLabel}</div>
		</div>
	)
}

const AccountPage = () => {
	const t = useTranslations('account')
	const tAuth = useTranslations('auth')
	const tCommon = useTranslations('common')
	const nameGuidanceContent = (
		<div className='space-y-2'>
			<p>{t('nameGuidanceIntro')}</p>
			<ul className='list-disc pl-4 space-y-1'>
				<li>{t('nameGuidanceForeign')}</li>
				<li>{t('nameGuidanceNoNicknames')}</li>
				<li>{t('nameGuidanceDenyEntry')}</li>
			</ul>
		</div>
	)
	const account = useAuthStore(state => state.account)
	const isVerified = Boolean(account?.is_verified)
	const [isEditing, setIsEditing] = useState(false)
	const [showIdCard, setShowIdCard] = useState(false)
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		fursona_name: '',
		country: '',
		id_card: '',
		date_of_birth: '',
	})
	const updateMeMutation = useUpdateMe()
	const updateAvatarMutation = useUpdateAvatar()
	const verifyOtpMutation = useVerifyOtp()
	const resendOtpMutation = useResendOtp()
	const [otp, setOtp] = useState('')

	const handleAvatarUploadSuccess = useCallback(
		(fileUrl: string) => {
			if (!isVerified) {
				toast.error(tAuth('userNotVerified'))
				return
			}
			updateAvatarMutation.mutate(
				{ avatar: fileUrl },
				{
					onSuccess: data => {
						if (data.isSuccess) {
							toast.success(t('avatarUpdateSuccess'))
						}
					},
					onError: () => {
						toast.error(t('avatarUpdateError'))
					},
				}
			)
		},
		[updateAvatarMutation, t, isVerified, tAuth]
	)

	const handleAvatarRemove = useCallback(() => {
		if (!isVerified) {
			toast.error(tAuth('userNotVerified'))
			return
		}
		updateAvatarMutation.mutate(
			{ avatar: '' },
			{
				onSuccess: data => {
					if (data.isSuccess) {
						toast.success(t('avatarRemoveSuccess'))
					}
				},
				onError: () => {
					toast.error(t('avatarRemoveError'))
				},
			}
		)
	}, [updateAvatarMutation, t, isVerified, tAuth])

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target
			setFormData(prev => ({
				...prev,
				[name]: value,
			}))
		},
		[]
	)

	// Initialize form data when account loads (only when not editing)
	useEffect(() => {
		if (account && !isEditing) {
			setFormData({
				first_name: account.first_name || '',
				last_name: account.last_name || '',
				fursona_name: account.fursona_name || '',
				country: account.country || '',
				id_card: account.id_card || '',
				date_of_birth: account.date_of_birth || '',
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account?.id]) // Only sync when account ID changes (new account loaded), not on every account update

	// Safety: never allow editing while unverified
	useEffect(() => {
		if (!isVerified && isEditing) setIsEditing(false)
	}, [isVerified, isEditing])

	if (!account) {
		return (
			<div className='flex items-center justify-center min-h-[200px]'>
				<div className='text-sm text-gray-500 dark:text-dark-text-secondary'>
					{t('noAccountInfo')}
				</div>
			</div>
		)
	}

	// Combine first and last name for full name
	const fullName =
		[account.first_name, account.last_name].filter(Boolean).join(' ') ||
		undefined

	const handleCancel = () => {
		setFormData({
			first_name: account.first_name || '',
			last_name: account.last_name || '',
			fursona_name: account.fursona_name || '',
			country: account.country || '',
			id_card: account.id_card || '',
			date_of_birth: account.date_of_birth || '',
		})
		setIsEditing(false)
	}

	const handleVerifyOtp = () => {
		if (!account?.email || otp.trim().length !== 6) return
		verifyOtpMutation.mutate(
			{ email: account.email, otp: otp.trim() },
			{
				onSuccess: data => {
					if (data.isSuccess) {
						toast.success(t('emailVerifiedSuccess'))
						setOtp('')
					}
				},
				onError: (err: Error) => {
					const key = (
						err as { response?: { data?: { errorMessage?: string } } }
					)?.response?.data?.errorMessage
					toast.error(
						key
							? tAuth(
									key as
										| 'invalidOrExpiredOtp'
										| 'verifyOtpFailed'
										| 'userNotFound'
								)
							: tAuth('verifyOtpFailed')
					)
				},
			}
		)
	}

	const handleResendOtp = () => {
		if (!account?.email) return
		resendOtpMutation.mutate(
			{ email: account.email },
			{
				onSuccess: data => {
					if (data.isSuccess) toast.success(t('verificationCodeSent'))
				},
				onError: (err: Error) => {
					const key = (
						err as { response?: { data?: { errorMessage?: string } } }
					)?.response?.data?.errorMessage
					toast.error(
						key
							? tAuth(key as 'alreadyVerified' | 'resendOtpFailed')
							: tAuth('resendOtpFailed')
					)
				},
			}
		)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!isVerified) {
			toast.error(tAuth('userNotVerified'))
			return
		}

		updateMeMutation.mutate(
			{
				first_name: formData.first_name || undefined,
				last_name: formData.last_name || undefined,
				fursona_name: formData.fursona_name || undefined,
				country: getCode(formData.country) || undefined,
				id_card: formData.id_card || undefined,
				date_of_birth: formData.date_of_birth || undefined,
			},
			{
				onSuccess: data => {
					if (data.isSuccess) {
						setIsEditing(false)
						toast.success(t('updateSuccess'))
					}
				},
				onError: (err: Error) => {
					const key = (
						err as { response?: { data?: { errorMessage?: string } } }
					)?.response?.data?.errorMessage
					toast.error(
						key
							? tAuth(key as 'validation.ageRequirement' | 'validationFailed')
							: t('updateError')
					)
				},
			}
		)
	}

	return (
		<div className='rounded-[30px] p-6 sm:p-10 shadow-sm text-text-secondary'>
			{/* Profile header – avatar + display name */}
			<div className='flex flex-col items-center gap-3 pb-6 border-b border-[#48715B]/15'>
				<UserAvatar
					account={account}
					uploadable={isVerified}
					onUploadSuccess={isVerified ? handleAvatarUploadSuccess : undefined}
					onUploadError={error =>
						toast.error(t('uploadError', { message: error.message }))
					}
					onRemove={isVerified ? handleAvatarRemove : undefined}
				/>
				<div className='text-center'>
					<p className='text-xl font-semibold text-text-primary leading-tight'>
						{account.fursona_name || fullName || account.email}
					</p>
					{(account.fursona_name || fullName) && (
						<p className='text-sm text-[#8C8C8C] mt-1'>{account.email}</p>
					)}
				</div>
			</div>

			<form onSubmit={handleSubmit} className='mt-6'>
				<div className='space-y-4'>
					{isEditing ? (
						<>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<InfoField
									label={t('firstName')}
									value={formData.first_name}
									name='first_name'
									editable={isEditing}
									onChange={handleInputChange}
									emptyLabel={t('na')}
								/>
								<InfoField
									label={t('lastName')}
									value={formData.last_name}
									name='last_name'
									editable={isEditing}
									onChange={handleInputChange}
									emptyLabel={t('na')}
								/>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<InfoField
									label={t('fursonaName')}
									value={formData.fursona_name}
									name='fursona_name'
									editable={isEditing}
									onChange={handleInputChange}
									emptyLabel={t('na')}
								/>
								<InfoField
									label={t('email')}
									value={account.email}
									emptyLabel={t('na')}
								/>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 focus-within:border-[#48715B] transition-colors duration-200'>
									<label
										htmlFor='country-select'
										className='text-sm font-medium text-[#48715B] pointer-events-none'
									>
										{t('country')}
									</label>
									<div className='flex items-center gap-2'>
										<select
											id='country-select'
											value={getName(formData.country)}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													country: e.target.value,
												}))
											}
											className='block w-full bg-transparent text-lg text-text-secondary font-normal focus:outline-none appearance-none cursor-pointer'
										>
											<option value='' disabled>
												{t('selectCountry')}
											</option>
											{COUNTRY_NAMES().map(c => (
												<option key={c} value={c}>
													{c}
												</option>
											))}
											{formData.country &&
												!COUNTRY_NAMES().includes(formData.country) && (
													<option value={formData.country}>
														{formData.country}
													</option>
												)}
										</select>
										<ChevronDown className='w-3.5 h-3.5 text-[#8C8C8C]/50 flex-shrink-0 pointer-events-none' />
									</div>
								</div>
								<InfoField
									label={t('idCard')}
									value={formData.id_card}
									name='id_card'
									editable={isEditing}
									onChange={handleInputChange}
									emptyLabel={t('na')}
								/>
								{isEditing ? (
									<div className='space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 focus-within:border-[#48715B] transition-colors duration-200 cursor-text'>
										<label
											htmlFor='date_of_birth-input'
											className='text-sm font-medium text-[#48715B] pointer-events-none'
										>
											{t('dateOfBirth')}
										</label>
										<div className='flex items-center gap-2'>
											<input
												type='date'
												id='date_of_birth-input'
												name='date_of_birth'
												value={formData.date_of_birth}
												onChange={handleInputChange}
												className='block w-full bg-transparent text-lg text-text-secondary font-normal focus:outline-none'
											/>
											<Pencil className='w-3.5 h-3.5 text-[#8C8C8C]/50 flex-shrink-0' />
										</div>
									</div>
								) : null}
							</div>
						</>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<InfoField
								label={t('fullName')}
								value={fullName}
								emptyLabel={t('na')}
								helpContent={nameGuidanceContent}
							/>
							<InfoField
								label={t('fursonaName')}
								value={account.fursona_name}
								emptyLabel={t('na')}
							/>
							<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
								<label className='text-sm font-medium text-[#48715B]'>
									{t('email')}
								</label>
								<div className='flex flex-wrap items-center gap-2 text-lg text-text-secondary'>
									<span>{account.email || t('na')}</span>
									{!account.is_verified && (
										<span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium'>
											<AlertCircle className='w-3.5 h-3.5 shrink-0' />
											{tAuth('userNotVerified')}
										</span>
									)}
								</div>
							</div>
							<InfoField
								label={t('country')}
								value={getName(account.country || '')}
								emptyLabel={t('na')}
							/>
							<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
								<label className='text-sm font-medium text-[#48715B]'>
									{t('idCard')}
								</label>
								<div className='flex items-center justify-between gap-2'>
									<div className='text-lg text-text-secondary'>
										{(showIdCard ? account.id_card : maskIdCard(account.id_card)) ||
											t('na')}
									</div>
									<button
										type='button'
										onClick={() => setShowIdCard(v => !v)}
										className='p-2 rounded-lg hover:bg-black/5 transition-colors'
										aria-label={showIdCard ? 'Hide ID card' : 'Show ID card'}
									>
										{showIdCard ? (
											<EyeOff className='w-5 h-5 text-[#48715B]' />
										) : (
											<Eye className='w-5 h-5 text-[#48715B]' />
										)}
									</button>
								</div>
							</div>
							<InfoField
								label={t('dateOfBirth')}
								value={account.date_of_birth}
								emptyLabel={t('na')}
							/>
						</div>
					)}
				</div>

				{/* Verify email (only when not verified) */}
				{!account.is_verified && (
					<div className='mt-6 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-4'>
						<h3 className='text-sm font-semibold text-[#48715B] mb-2'>
							{t('verifyEmail')}
						</h3>
						<p className='text-sm text-text-secondary dark:text-dark-text-secondary mb-3'>
							{t('enterOtp')}
						</p>
						<div className='flex flex-wrap items-end gap-3'>
							<div className='flex-1 min-w-[120px]'>
								<label htmlFor='profile-otp' className='sr-only'>
									{t('enterOtp')}
								</label>
								<input
									id='profile-otp'
									type='text'
									inputMode='numeric'
									autoComplete='one-time-code'
									maxLength={6}
									placeholder='000000'
									value={otp}
									onChange={e =>
										setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
									}
									className='w-full px-3 py-2.5 rounded-lg border border-[#8C8C8C]/30 dark:border-dark-border bg-white dark:bg-dark-surface text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#48715B] dark:focus:ring-amber-500'
								/>
							</div>
							<div className='flex gap-2'>
								<button
									type='button'
									onClick={handleVerifyOtp}
									disabled={verifyOtpMutation.isPending || otp.length !== 6}
									className='px-4 py-2.5 rounded-lg bg-[#48715B] dark:bg-amber-600 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{verifyOtpMutation.isPending
										? tCommon('processing')
										: t('verify')}
								</button>
								<button
									type='button'
									onClick={handleResendOtp}
									disabled={resendOtpMutation.isPending}
									className='px-4 py-2.5 rounded-lg border border-[#8C8C8C]/40 dark:border-dark-border font-medium hover:bg-amber-100/50 dark:hover:bg-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{resendOtpMutation.isPending
										? tCommon('processing')
										: t('resendVerificationCode')}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Edit / Save actions */}
				<div className='mt-6 pt-5 border-t border-[#48715B]/15'>
					{!isEditing ? (
						<>
							{!isVerified ? (
								<div className='mb-3 flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-3 text-sm text-text-secondary dark:text-dark-text-secondary'>
									<AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300' />
									<span>{tAuth('userNotVerified')}</span>
								</div>
							) : null}
							<button
								type='button'
								disabled={!isVerified}
								onClick={() => {
									if (!isVerified) return
									setFormData({
										first_name: account.first_name || '',
										last_name: account.last_name || '',
										fursona_name: account.fursona_name || '',
										country: account.country || '',
										id_card: account.id_card || '',
										date_of_birth: account.date_of_birth || '',
									})
									setIsEditing(true)
								}}
								className='shadow-md w-full py-2.5 px-4 text-xl rounded-xl btn-primary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{t('editInfo')}
							</button>
						</>
					) : (
						<div className='flex gap-3'>
							<button
								type='submit'
								disabled={updateMeMutation.isPending || !isVerified}
								className='shadow-md flex-1 py-2.5 px-4 text-xl rounded-xl btn-primary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{updateMeMutation.isPending
									? tCommon('saving')
									: t('saveChanges')}
							</button>
							<button
								type='button'
								onClick={handleCancel}
								disabled={updateMeMutation.isPending || !isVerified}
								className='shadow-md flex-1 py-2.5 px-4 text-xl rounded-xl btn-primary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{tCommon('cancel')}
							</button>
						</div>
					)}
				</div>
			</form>
		</div>
	)
}

export default AccountPage
