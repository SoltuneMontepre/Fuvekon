'use client'

import React, { useState, useEffect } from 'react'
import { Ban, X, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface AccountForBan {
	id: string
	email?: string
	first_name?: string
	last_name?: string
	fursona_name?: string
}

interface BanUserModalProps {
	user: AccountForBan | null
	onClose: () => void
	onConfirm: (reason: string) => Promise<void>
	isPending: boolean
}

const BanUserModal = ({ user, onClose, onConfirm, isPending }: BanUserModalProps) => {
	const t = useTranslations('admin')
	const [reason, setReason] = useState('')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (user) {
			setReason('')
			setError(null)
		}
	}, [user])

	if (!user) return null

	const displayName =
		user.first_name || user.last_name
			? `${user.first_name || ''} ${user.last_name || ''}`.trim()
			: user.fursona_name || user.email || user.id

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const trimmed = reason.trim()
		if (trimmed.length > 500) {
			setError(t('banReasonMaxLength') || 'Reason must be at most 500 characters.')
			return
		}
		setError(null)
		try {
			await onConfirm(trimmed)
			onClose()
		} catch {
			// Error toast handled by parent
		}
	}

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && !isPending) onClose()
	}

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
			onClick={handleBackdropClick}
			role='dialog'
			aria-modal='true'
			aria-labelledby='ban-modal-title'
		>
			<div className='bg-main rounded-xl border border-[#8C8C8C]/15 p-6 max-w-md mx-4 shadow-2xl w-full'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center gap-2'>
						<Ban className='w-6 h-6 text-red-600' />
						<h2 id='ban-modal-title' className='text-xl font-semibold text-text-primary josefin'>
							{t('banUserTitle') || 'Ban user'}
						</h2>
					</div>
					<button
						type='button'
						onClick={onClose}
						disabled={isPending}
						className='p-1.5 rounded-lg hover:bg-[#E2EEE2]/60 transition-colors text-[#8C8C8C] disabled:opacity-50'
						aria-label={t('close') || 'Close'}
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				<p className='text-sm text-text-secondary mb-4'>
					{t('banUserDesc') || 'This will blacklist the user from purchasing tickets.'}{' '}
					<span className='font-medium text-text-primary'>{displayName}</span>
					{user.email && (
						<>
							{' '}
							<span className='text-[#8C8C8C]'>({user.email})</span>
						</>
					)}
				</p>

				<form onSubmit={handleSubmit}>
					<label htmlFor='ban-reason' className='block text-sm font-medium text-[#48715B] mb-1.5'>
						{t('banReasonLabel') || 'Reason'} <span className='text-[#8C8C8C] font-normal'>({t('banReasonOptional') || 'optional'})</span>
					</label>
					<textarea
						id='ban-reason'
						value={reason}
						onChange={e => {
							setReason(e.target.value)
							setError(null)
						}}
						placeholder={t('banReasonPlaceholder') || 'e.g. Violation of terms, fraud...'}
						rows={3}
						maxLength={500}
						className='w-full px-3 py-2.5 rounded-xl bg-white border border-[#8C8C8C]/15 text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none focus:border-[#48715B] transition-colors resize-y min-h-[80px]'
						disabled={isPending}
						aria-invalid={!!error}
						aria-describedby={error ? 'ban-reason-error' : undefined}
					/>
					{error && (
						<p id='ban-reason-error' className='mt-1.5 text-sm text-red-600' role='alert'>
							{error}
						</p>
					)}
					<p className='mt-1 text-xs text-[#8C8C8C]'>
						{reason.length}/500
					</p>

					<div className='flex gap-3 mt-6'>
						<button
							type='button'
							onClick={onClose}
							disabled={isPending}
							className='flex-1 py-2.5 rounded-xl border border-[#8C8C8C]/15 text-text-secondary hover:bg-[#E2EEE2]/60 transition-colors disabled:opacity-50'
						>
							{t('cancel') || 'Cancel'}
						</button>
						<button
							type='submit'
							disabled={isPending}
							className='flex-1 py-2.5 rounded-xl border border-red-400 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2'
						>
							{isPending ? (
								<>
									<Loader2 className='w-4 h-4 animate-spin' />
									{t('banning') || 'Banning...'}
								</>
							) : (
								<>
									<Ban className='w-4 h-4' />
									{t('ban') || 'Ban'}
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default BanUserModal
