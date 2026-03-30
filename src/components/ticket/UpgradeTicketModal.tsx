'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpCircle, Check, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useGetTiers, useUpgradeTicket } from '@/hooks/services/ticket/useTicket'
import Loading from '@/components/common/Loading'
import type { TicketTier } from '@/types/models/ticket/ticket'

const formatPriceVnd = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

const formatPriceUsd = (usd: number): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(usd)
}

const getTierAmountByLocale = (
	tier: TicketTier | null | undefined,
	locale: string
): { value: number; label: string } => {
	if (!tier) return { value: 0, label: locale === 'vi' ? '0 VND' : '$0.00' }

	if (locale === 'vi') {
		const vnd = Number(tier.price) || 0
		return { value: vnd, label: `${formatPriceVnd(vnd)} VND` }
	}

	const usd = Number(tier.price_usd ?? 0)
	if (usd > 0) return { value: usd, label: formatPriceUsd(usd) }

	const vnd = Number(tier.price) || 0
	return { value: vnd, label: `${formatPriceVnd(vnd)} VND` }
}

interface UpgradeTicketModalProps {
	currentTier: TicketTier
	onClose: () => void
}

const UpgradeTicketModal = ({ currentTier, onClose }: UpgradeTicketModalProps) => {
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const locale = useLocale()
	const router = useRouter()
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		dialog?.showModal()
		return () => dialog?.close()
	}, [])

	const { data: tiersData, isLoading: tiersLoading } = useGetTiers()
	const upgradeMutation = useUpgradeTicket()
	const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
	const [showConfirm, setShowConfirm] = useState(false)
	const [isUpgrading, setIsUpgrading] = useState(false)

	const currentAmount = getTierAmountByLocale(currentTier, locale)
	const eligibleTiers = (tiersData?.data ?? []).filter(
		(tier) =>
			// Eligibility is still based on VND price ordering (upgrade logic); display uses locale.
			Number(tier.price) > Number(currentTier?.price) &&
			tier.stock > 0 &&
			tier.is_active &&
			tier.id !== currentTier.id
	)

	const selectedAmount = getTierAmountByLocale(selectedTier, locale)
	const priceDifference = selectedAmount.value - currentAmount.value

	const handleUpgrade = async () => {
		if (!selectedTier) return
		setIsUpgrading(true)
		try {
			const result = await upgradeMutation.mutateAsync(selectedTier.id)
			if (result.isSuccess) {
				toast.success(t('upgradeSuccess'))
				const diff = selectedTier.price - currentTier.price
				router.push(`/ticket/purchase/${selectedTier.id}?upgrade=true&diff=${diff}`)
				return // keep loading up through navigation
			}
			setIsUpgrading(false)
		} catch {
			toast.error(t('upgradeError'))
			setIsUpgrading(false)
		}
	}

	return (
		<dialog
			ref={dialogRef}
			onCancel={onClose}
			className='bg-white rounded-xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl backdrop:bg-black/50 m-auto'
		>
			{isUpgrading && <Loading />}
			<div>
				{/* Header */}
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-2'>
						<ArrowUpCircle className='w-6 h-6 text-[#48715b]' />
						<h3 className='text-xl font-semibold text-[#154c5b]'>{t('upgradeTitle')}</h3>
					</div>
					<button
						onClick={onClose}
						className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-500' />
					</button>
				</div>

				{/* Current tier info */}
				<div className='bg-[#d2ddd2] rounded-lg p-3 mb-4'>
					<p className='text-sm text-[#48715b]'>{t('upgradeCurrentTier')}</p>
					<p className='font-semibold text-[#154c5b]'>
						{currentTier.ticket_name} — {currentAmount.label}
					</p>
				</div>

				{/* Tier selection */}
				{!showConfirm ? (
					<>
						{tiersLoading ? (
							<Loading />
						) : eligibleTiers.length === 0 ? (
							<div className='text-center py-8'>
								<p className='text-[#48715b]'>{t('noUpgradesAvailable')}</p>
							</div>
						) : (
							<div className='space-y-3'>
								<p className='text-sm font-medium text-[#154c5b]'>{t('upgradeNewTier')}</p>
								{eligibleTiers.map((tier) => {
									const tierAmount = getTierAmountByLocale(tier, locale)
									const diff = tierAmount.value - currentAmount.value
									const isSelected = selectedTier?.id === tier.id
									return (
										<button
											key={tier.id}
											onClick={() => setSelectedTier(tier)}
											className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
												isSelected
													? 'border-[#48715b] bg-[#e9f5e7]'
													: 'border-gray-200 hover:border-[#a0c4b0]'
											}`}
										>
											<div className='flex items-center justify-between'>
												<div>
													<p className='font-semibold text-[#154c5b]'>{tier.ticket_name}</p>
													<p className='text-sm text-[#48715b]'>
														{tierAmount.label}
													</p>
													<p className='text-xs font-medium text-[#c97b2a]'>
														{tier.stock < 10 ? t('runningOut') : t('ticketsAbundant')}
													</p>
												</div>
												<div className='text-right'>
													<p className='text-sm text-[#48715b]'>{t('upgradePriceDifference')}</p>
													<p className='font-bold text-[#154c5b] text-lg'>
														{diff >= 0 ? '+' : ''}
														{locale === 'vi'
															? `${formatPriceVnd(diff)} VND`
															: formatPriceUsd(diff)}
													</p>
													{isSelected && <Check className='w-5 h-5 text-[#48715b] ml-auto mt-1' />}
												</div>
											</div>
										</button>
									)
								})}

								<button
									onClick={() => selectedTier && setShowConfirm(true)}
									disabled={!selectedTier}
									className='w-full py-3 px-4 rounded-lg bg-[#48715b] text-white font-semibold hover:bg-[#3a5a4a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-4'
								>
									{tCommon('continue')}
								</button>
							</div>
						)}
					</>
				) : (
					/* Confirmation step */
					<div>
						<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
							<p className='text-yellow-800 font-medium mb-2'>{t('upgradeResetWarning')}</p>
						</div>

						<div className='bg-[#e9f5e7] rounded-lg p-4 mb-6'>
							<div className='grid grid-cols-2 gap-3'>
								<div>
									<p className='text-sm text-[#48715b]'>{t('upgradeCurrentTier')}</p>
									<p className='font-medium text-[#154c5b]'>{currentTier.ticket_name}</p>
									<p className='text-sm text-[#48715b]'>{currentAmount.label}</p>
								</div>
								<div>
									<p className='text-sm text-[#48715b]'>{t('upgradeNewTier')}</p>
									<p className='font-medium text-[#154c5b]'>{selectedTier?.ticket_name}</p>
									<p className='text-sm text-[#48715b]'>
										{selectedAmount.label}
									</p>
								</div>
							</div>
							<div className='border-t border-[#a0c4b0] mt-3 pt-3'>
								<div className='flex items-center justify-between'>
									<p className='font-medium text-[#154c5b]'>{t('upgradePriceDifference')}</p>
									<p className='font-bold text-[#154c5b] text-xl'>
										{priceDifference >= 0 ? '+' : ''}
										{locale === 'vi'
											? `${formatPriceVnd(priceDifference)} VND`
											: formatPriceUsd(priceDifference)}
									</p>
								</div>
							</div>
						</div>

						<div className='flex gap-3'>
							<button
								onClick={() => setShowConfirm(false)}
								className='flex-1 py-2 px-4 rounded-lg border border-[#48715b] text-[#48715b] hover:bg-[#e9f5e7]'
							>
								{tCommon('back')}
							</button>
							<button
								onClick={handleUpgrade}
								className='flex-1 py-2 px-4 rounded-lg bg-[#48715b] text-white hover:bg-[#3a5a4a]'
							>
								{t('upgradeConfirm')}
							</button>
						</div>
					</div>
				)}
			</div>
		</dialog>
	)
}

export default UpgradeTicketModal
