'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowUpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useGetMyTicket, useUpdateBadgeDetails, useCancelTicket } from '@/hooks/services/ticket/useTicket'
import type { TicketStatus } from '@/types/models/ticket/ticket'

// Format price in VND
const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Status display configuration (icons only, labels come from translations)
const STATUS_ICONS: Record<TicketStatus, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
	pending: {
		icon: <Clock className='w-5 h-5' />,
		bgColor: 'bg-yellow-50',
		textColor: 'text-yellow-700',
	},
	self_confirmed: {
		icon: <RefreshCw className='w-5 h-5 animate-spin' />,
		bgColor: 'bg-blue-50',
		textColor: 'text-blue-700',
	},
	approved: {
		icon: <CheckCircle className='w-5 h-5' />,
		bgColor: 'bg-green-50',
		textColor: 'text-green-700',
	},
	denied: {
		icon: <XCircle className='w-5 h-5' />,
		bgColor: 'bg-red-50',
		textColor: 'text-red-700',
	},
}

const MyTicketDisplay = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const [showBadgeForm, setShowBadgeForm] = useState(false)
	const [showCancelDialog, setShowCancelDialog] = useState(false)
	const [badgeName, setBadgeName] = useState('')
	const [isFursuiter, setIsFursuiter] = useState(false)
	const [isFursuitStaff, setIsFursuitStaff] = useState(false)

	const { data: ticketData, isLoading, error, refetch } = useGetMyTicket()
	const updateBadgeMutation = useUpdateBadgeDetails()
	const cancelTicketMutation = useCancelTicket()

	const ticket = ticketData?.data

	// Get status label from translations
	const getStatusLabel = (status: TicketStatus): string => {
		const statusLabels: Record<TicketStatus, string> = {
			pending: t('status.pending'),
			self_confirmed: t('status.selfConfirmed'),
			approved: t('status.approved'),
			denied: t('status.denied'),
		}
		return statusLabels[status]
	}

	const handleUpdateBadge = async () => {
		if (!badgeName.trim()) return

		try {
			await updateBadgeMutation.mutateAsync({
				con_badge_name: badgeName.trim(),
				is_fursuiter: isFursuiter,
				is_fursuit_staff: isFursuitStaff,
			})
			setShowBadgeForm(false)
			toast.success(t('badgeUpdatedSuccess') || 'Badge details updated successfully!')
		} catch {
			toast.error(t('badgeUpdateError') || 'Failed to update badge details. Please try again.')
		}
	}

	const handleCancelTicket = async () => {
		setShowCancelDialog(false)
		try {
			await cancelTicketMutation.mutateAsync()
			toast.success(t('ticketCancelledSuccess') || 'Ticket cancelled successfully!')
			router.push('/ticket')
		} catch {
			toast.error(t('ticketCancelError') || 'Failed to cancel ticket. Please try again.')
		}
	}

	// Show error toast when error occurs
	useEffect(() => {
		if (error) {
			toast.error(t('couldNotLoadTicket') || 'Could not load ticket information')
		}
	}, [error, t])

	if (isLoading) {
		return (
			<div className='p-6 bg-[#e2eee2] rounded-xl border-2 border-[#548780]'>
				<div className='text-center text-[#48715b]'>{tCommon('loading')}</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-6 bg-[#e2eee2] rounded-xl border-2 border-[#548780]'>
				<div className='text-center text-[#48715b]'>
					<AlertCircle className='w-12 h-12 mx-auto mb-4' />
					<p>{t('couldNotLoadTicket')}</p>
				</div>
				<button
					onClick={() => refetch()}
					className='mt-4 px-4 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85] mx-auto block'
				>
					{tCommon('retry')}
				</button>
			</div>
		)
	}

	// No ticket - show buy ticket prompt
	if (!ticket) {
		return (
			<div className='p-6 bg-[#e2eee2] rounded-xl border-2 border-[#548780]'>
				<div className='text-center'>
					<AlertCircle className='w-12 h-12 text-[#48715b] mx-auto mb-4' />
					<h3 className='text-lg font-semibold text-[#154c5b] mb-2'>{t('noTicket')}</h3>
					<p className='text-[#48715b] mb-4'>{t('noTicketDesc')}</p>
					<button
						onClick={() => router.push('/ticket')}
						className='px-6 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85] font-semibold'
					>
						{t('buyNow')}
					</button>
				</div>
			</div>
		)
	}

	const statusConfig = STATUS_ICONS[ticket.status]
	const tier = ticket.tier

	return (
		<div className='bg-[#e2eee2] rounded-xl border-2 border-[#548780] overflow-hidden'>
			{/* Header */}
			<div className='bg-[#548780] px-6 py-4'>
				<h3 className='text-xl font-bold text-white josefin'>{t('ticketInfo')}</h3>
			</div>

			{/* Status Banner */}
			<div className={`px-6 py-3 ${statusConfig.bgColor} flex items-center gap-2`}>
				<span className={statusConfig.textColor}>{statusConfig.icon}</span>
				<span className={`font-semibold ${statusConfig.textColor}`}>{getStatusLabel(ticket.status)}</span>
			</div>

			<div className='p-6'>
				{/* Ticket Details */}
				<div className='grid grid-cols-2 gap-4 mb-6'>
					<div>
						<p className='text-sm text-[#48715b]'>{t('referenceCode')}</p>
						<p className='font-mono font-bold text-[#154c5b] text-lg'>{ticket.reference_code}</p>
					</div>
					<div>
						<p className='text-sm text-[#48715b]'>{t('ticketType')}</p>
						<p className='font-semibold text-[#154c5b]'>{tier?.ticket_name || 'N/A'}</p>
					</div>
					{tier && (
						<div>
							<p className='text-sm text-[#48715b]'>{t('ticketPrice')}</p>
							<p className='font-semibold text-[#154c5b]'>{formatPrice(tier.price)} VND</p>
						</div>
					)}
					<div>
						<p className='text-sm text-[#48715b]'>{t('purchaseDate')}</p>
						<p className='font-medium text-[#154c5b]'>
							{new Date(ticket.created_at).toLocaleDateString('vi-VN')}
						</p>
					</div>
				</div>

				{/* Status-specific content */}
				{ticket.status === 'pending' && (
					<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'>
						<p className='text-yellow-800 text-sm'>{t('completePayment')}</p>
						<div className='flex gap-2 mt-3'>
							<button
								onClick={() => router.push(`/ticket/purchase/${tier?.id}`)}
								className='flex-1 px-4 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85] font-semibold'
							>
								{t('payNow')}
							</button>
							<button
								onClick={() => setShowCancelDialog(true)}
								disabled={cancelTicketMutation.isPending}
								className='px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-semibold disabled:opacity-50'
							>
								{cancelTicketMutation.isPending ? tCommon('processing') : tCommon('cancel')}
							</button>
						</div>
					</div>
				)}

				{ticket.status === 'self_confirmed' && (
					<div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'>
						<p className='text-blue-800 text-sm'>{t('paymentReceived')}</p>
						<p className='text-blue-600 text-xs mt-2'>{t('verificationTime')}</p>
						<button
							onClick={() => setShowCancelDialog(true)}
							disabled={cancelTicketMutation.isPending}
							className='mt-3 w-full px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-semibold disabled:opacity-50'
						>
							{cancelTicketMutation.isPending ? tCommon('processing') : tCommon('cancel')}
						</button>
					</div>
				)}

				{ticket.status === 'denied' && (
					<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
						<p className='text-red-800 text-sm mb-2'>{t('ticketDenied')}</p>
						{ticket.denial_reason && (
							<p className='text-red-700 text-sm'>
								<strong>{t('denialReason')}:</strong> {ticket.denial_reason}
							</p>
						)}
						<button
							onClick={() => router.push('/ticket')}
							className='mt-3 px-4 py-2 bg-[#48715b] text-white rounded-lg hover:bg-[#3a5a4a] font-semibold'
						>
							{t('tryAnotherTicket')}
						</button>
					</div>
				)}

				{/* Badge Details for Approved Tickets */}
				{ticket.status === 'approved' && (
					<>
						<div className='border-t border-[#548780] pt-4 mt-4'>
							<h4 className='font-semibold text-[#154c5b] mb-4'>{t('badgeInfo')}</h4>

							{ticket.con_badge_name ? (
								<div className='flex gap-4'>
									{ticket.badge_image && (
										<div className='w-24 h-24 relative rounded-lg overflow-hidden border-2 border-[#548780]'>
											<Image src={ticket.badge_image} alt='Badge' fill className='object-cover' />
										</div>
									)}
									<div className='flex-1'>
										<div className='mb-2'>
											<p className='text-sm text-[#48715b]'>{t('badgeName')}</p>
											<p className='font-semibold text-[#154c5b]'>{ticket.con_badge_name}</p>
										</div>
										<div className='flex gap-4'>
											<div>
												<p className='text-sm text-[#48715b]'>{t('fursuiter')}</p>
												<p className='font-medium text-[#154c5b]'>
													{ticket.is_fursuiter ? tCommon('yes') : tCommon('no')}
												</p>
											</div>
											<div>
												<p className='text-sm text-[#48715b]'>{t('fursuitStaff')}</p>
												<p className='font-medium text-[#154c5b]'>
													{ticket.is_fursuit_staff ? tCommon('yes') : tCommon('no')}
												</p>
											</div>
										</div>
									</div>
								</div>
							) : (
								<>
									{!showBadgeForm ? (
										<div className='bg-[#d2ddd2] rounded-lg p-4'>
											<p className='text-[#48715b] text-sm mb-3'>{t('noBadgeYet')}</p>
											<button
												onClick={() => setShowBadgeForm(true)}
												className='px-4 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85] font-semibold'
											>
												{t('updateBadge')}
											</button>
										</div>
									) : (
										<div className='bg-[#d2ddd2] rounded-lg p-4'>
											<div className='space-y-4'>
												<div>
													<label className='block text-sm text-[#48715b] mb-1'>
														{t('badgeName')} <span className='text-red-500'>*</span>
													</label>
													<input
														type='text'
														value={badgeName}
														onChange={e => setBadgeName(e.target.value)}
														placeholder={t('enterFursonaName')}
														className='w-full px-3 py-2 rounded-lg border border-[#548780] focus:outline-none focus:ring-2 focus:ring-[#7cbc97]'
													/>
												</div>
												<div className='flex gap-6'>
													<label className='flex items-center gap-2 cursor-pointer'>
														<input
															type='checkbox'
															checked={isFursuiter}
															onChange={e => setIsFursuiter(e.target.checked)}
															className='w-4 h-4 accent-[#7cbc97]'
														/>
														<span className='text-[#154c5b]'>{t('iAmFursuiter')}</span>
													</label>
													<label className='flex items-center gap-2 cursor-pointer'>
														<input
															type='checkbox'
															checked={isFursuitStaff}
															onChange={e => setIsFursuitStaff(e.target.checked)}
															className='w-4 h-4 accent-[#7cbc97]'
														/>
														<span className='text-[#154c5b]'>{t('fursuitStaff')}</span>
													</label>
												</div>
												<div className='flex gap-3'>
													<button
														onClick={() => setShowBadgeForm(false)}
														className='px-4 py-2 border border-[#48715b] text-[#48715b] rounded-lg hover:bg-[#c2cdc2]'
													>
														{tCommon('cancel')}
													</button>
													<button
														onClick={handleUpdateBadge}
														disabled={!badgeName.trim() || updateBadgeMutation.isPending}
														className='px-4 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85] disabled:bg-gray-300 disabled:cursor-not-allowed'
													>
														{updateBadgeMutation.isPending
															? tCommon('saving')
															: tCommon('save')}
													</button>
												</div>
											</div>
										</div>
									)}
								</>
							)}
						</div>

						{/* Upgrade Button (future feature) */}
						<div className='border-t border-[#548780] pt-4 mt-4'>
							<button
								disabled
								className='w-full py-3 px-4 rounded-lg border-2 border-dashed border-[#48715b] text-[#48715b] hover:bg-[#d2ddd2] flex items-center justify-center gap-2 opacity-50 cursor-not-allowed'
							>
								<ArrowUpCircle className='w-5 h-5' />
								<span>{t('upgradeTicket')}</span>
							</button>
						</div>
					</>
				)}
			</div>

			{/* Cancel Confirmation Dialog */}
			{showCancelDialog && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl'>
						<h3 className='text-xl font-semibold text-[#154c5b] mb-4'>{t('confirmCancelTicket')}</h3>
						<p className='text-[#48715b] mb-6'>
							{t('confirmCancelTicketDesc') || 'Bạn có chắc chắn muốn hủy vé này không? Số lượng vé sẽ được hoàn lại và bạn có thể mua vé mới.'}
						</p>
						<div className='flex gap-3'>
							<button
								onClick={() => setShowCancelDialog(false)}
								disabled={cancelTicketMutation.isPending}
								className='flex-1 py-2 px-4 rounded-lg border border-[#48715b] text-[#48715b] hover:bg-[#e9f5e7] disabled:opacity-50'
							>
								{tCommon('cancel')}
							</button>
							<button
								onClick={handleCancelTicket}
								disabled={cancelTicketMutation.isPending}
								className='flex-1 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
							>
								{cancelTicketMutation.isPending ? tCommon('processing') : t('confirmCancel') || 'Xác nhận hủy'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default MyTicketDisplay
