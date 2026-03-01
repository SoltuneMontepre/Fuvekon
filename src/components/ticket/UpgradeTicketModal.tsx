'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpCircle, Check, X, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useGetTiers, useUpgradeTicket } from '@/hooks/services/ticket/useTicket'
import type { TicketTier } from '@/types/models/ticket/ticket'

const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

interface UpgradeTicketModalProps {
	currentTier: TicketTier
	onClose: () => void
}

const UpgradeTicketModal = ({ currentTier, onClose }: UpgradeTicketModalProps) => {
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const router = useRouter()
	const { data: tiersData, isLoading: tiersLoading } = useGetTiers()
	const upgradeMutation = useUpgradeTicket()
	const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
	const [showConfirm, setShowConfirm] = useState(false)

	const eligibleTiers = (tiersData?.data ?? []).filter(
		(tier) => tier.price > currentTier.price && tier.stock > 0 && tier.is_active && tier.id !== currentTier.id
	)

	const priceDifference = selectedTier ? selectedTier.price - currentTier.price : 0

	const handleUpgrade = async () => {
		if (!selectedTier) return
		try {
			const result = await upgradeMutation.mutateAsync(selectedTier.id)
			if (result.isSuccess) {
				toast.success(t('upgradeSuccess'))
				const diff = selectedTier.price - currentTier.price
				router.push(`/ticket/purchase/${selectedTier.id}?upgrade=true&diff=${diff}`)
			}
		} catch {
			toast.error(t('upgradeError'))
		}
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div className='bg-white rounded-xl p-6 max-w-lg mx-4 shadow-2xl w-full max-h-[90vh] overflow-y-auto'>
				{/* Header */}
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-2'>
						<ArrowUpCircle className='w-6 h-6 text-[#48715b]' />
						<h3 className='text-xl font-semibold text-[#154c5b]'>{t('upgradeTitle')}</h3>
					</div>
					<button
						onClick={onClose}
						disabled={upgradeMutation.isPending}
						className='p-1 hover:bg-gray-100 rounded-lg transition-colors'
					>
						<X className='w-5 h-5 text-gray-500' />
					</button>
				</div>

				{/* Current tier info */}
				<div className='bg-[#d2ddd2] rounded-lg p-3 mb-4'>
					<p className='text-sm text-[#48715b]'>{t('upgradeCurrentTier')}</p>
					<p className='font-semibold text-[#154c5b]'>
						{currentTier.ticket_name} — {formatPrice(currentTier.price)} VND
					</p>
				</div>

				{/* Tier selection */}
				{!showConfirm ? (
					<>
						{tiersLoading ? (
							<div className='flex items-center justify-center py-8'>
								<Loader2 className='w-6 h-6 animate-spin text-[#48715b]' />
							</div>
						) : eligibleTiers.length === 0 ? (
							<div className='text-center py-8'>
								<p className='text-[#48715b]'>{t('noUpgradesAvailable')}</p>
							</div>
						) : (
							<div className='space-y-3'>
								<p className='text-sm font-medium text-[#154c5b]'>{t('upgradeNewTier')}</p>
								{eligibleTiers.map((tier) => {
									const diff = tier.price - currentTier.price
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
														{formatPrice(tier.price)} VND
													</p>
													<p className='text-xs text-gray-500'>
														{t('remaining', { count: tier.stock })}
													</p>
												</div>
												<div className='text-right'>
													<p className='text-sm text-[#48715b]'>{t('upgradePriceDifference')}</p>
													<p className='font-bold text-[#154c5b] text-lg'>
														+{formatPrice(diff)} VND
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
									<p className='text-sm text-[#48715b]'>{formatPrice(currentTier.price)} VND</p>
								</div>
								<div>
									<p className='text-sm text-[#48715b]'>{t('upgradeNewTier')}</p>
									<p className='font-medium text-[#154c5b]'>{selectedTier?.ticket_name}</p>
									<p className='text-sm text-[#48715b]'>
										{formatPrice(selectedTier?.price ?? 0)} VND
									</p>
								</div>
							</div>
							<div className='border-t border-[#a0c4b0] mt-3 pt-3'>
								<div className='flex items-center justify-between'>
									<p className='font-medium text-[#154c5b]'>{t('upgradePriceDifference')}</p>
									<p className='font-bold text-[#154c5b] text-xl'>
										+{formatPrice(priceDifference)} VND
									</p>
								</div>
							</div>
						</div>

						<div className='flex gap-3'>
							<button
								onClick={() => setShowConfirm(false)}
								disabled={upgradeMutation.isPending}
								className='flex-1 py-2 px-4 rounded-lg border border-[#48715b] text-[#48715b] hover:bg-[#e9f5e7] disabled:opacity-50'
							>
								{tCommon('back')}
							</button>
							<button
								onClick={handleUpgrade}
								disabled={upgradeMutation.isPending}
								className='flex-1 py-2 px-4 rounded-lg bg-[#48715b] text-white hover:bg-[#3a5a4a] disabled:opacity-50'
							>
								{upgradeMutation.isPending ? tCommon('processing') : t('upgradeConfirm')}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default UpgradeTicketModal
