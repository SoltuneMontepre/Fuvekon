'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	RefreshCw,
	ArrowUpCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	useGetMyTicket,
	useCancelTicket,
} from '@/hooks/services/ticket/useTicket'
import UpgradeTicketModal from '@/components/ticket/UpgradeTicketModal'
import type { TicketStatus } from '@/types/models/ticket/ticket'

// Format price in VND
const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Status display configuration
const STATUS_CONFIG: Record<
	TicketStatus,
	{ icon: React.ReactNode; textColor: string; pillBg: string }
> = {
	pending: {
		icon: <Clock className='w-4 h-4' />,
		textColor: 'text-amber-700',
		pillBg: 'bg-amber-100',
	},
	self_confirmed: {
		icon: <RefreshCw className='w-4 h-4 animate-spin' />,
		textColor: 'text-blue-700',
		pillBg: 'bg-blue-100',
	},
	approved: {
		icon: <CheckCircle className='w-4 h-4' />,
		textColor: 'text-green-700',
		pillBg: 'bg-green-100',
	},
	denied: {
		icon: <XCircle className='w-4 h-4' />,
		textColor: 'text-red-700',
		pillBg: 'bg-red-100',
	},
}

// Reusable info field matching account page style
const InfoField = ({ label, value }: { label: string; value: string }) => (
	<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
		<p className='text-sm font-medium text-[#48715B]'>{label}</p>
		<p className='text-lg text-text-secondary'>{value}</p>
	</div>
)

const MyTicketDisplay = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const [showCancelDialog, setShowCancelDialog] = useState(false)
	const [showUpgradeModal, setShowUpgradeModal] = useState(false)

	const { data: ticketData, isLoading, error, refetch } = useGetMyTicket()
	const cancelTicketMutation = useCancelTicket()

	const ticket = ticketData?.data

	const getStatusLabel = (status: TicketStatus): string => {
		const statusLabels: Record<TicketStatus, string> = {
			pending: t('status.pending'),
			self_confirmed: t('status.selfConfirmed'),
			approved: t('status.approved'),
			denied: t('status.denied'),
		}
		return statusLabels[status]
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

	useEffect(() => {
		if (error) {
			toast.error(t('couldNotLoadTicket') || 'Could not load ticket information')
		}
	}, [error, t])

	if (isLoading) {
		return (
			<div className='rounded-[30px] p-6 sm:p-10'>
				<div className='text-center text-[#48715b]'>{tCommon('loading')}</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='rounded-[30px] p-6 sm:p-10'>
				<div className='text-center text-[#48715b]'>
					<AlertCircle className='w-12 h-12 mx-auto mb-4' />
					<p>{t('couldNotLoadTicket')}</p>
				</div>
				<button
					onClick={() => refetch()}
					className='mt-4 px-4 py-2.5 rounded-xl btn-primary font-medium mx-auto block'
				>
					{tCommon('retry')}
				</button>
			</div>
		)
	}

	if (!ticket) {
		return (
			<div className='rounded-[30px] p-6 sm:p-10 text-center'>
				<AlertCircle className='w-12 h-12 text-[#48715b] mx-auto mb-4' />
				<h3 className='text-lg font-semibold text-text-primary mb-2'>
					{t('noTicket')}
				</h3>
				<p className='text-text-secondary mb-4'>{t('noTicketDesc')}</p>
				<button
					onClick={() => router.push('/ticket')}
					className='px-6 py-2.5 rounded-xl btn-primary font-medium'
				>
					{t('buyNow')}
				</button>
			</div>
		)
	}

	const statusConfig = STATUS_CONFIG[ticket.status]
	const tier = ticket.tier

	return (
		<div className='rounded-[30px] p-6 sm:p-10 text-text-secondary'>
			{/* Title + Status pill */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#48715B]/15'>
				<h2 className='text-xl font-semibold text-text-primary'>
					{t('ticketInfo')}
				</h2>
				<span
					className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.pillBg} ${statusConfig.textColor}`}
				>
					{statusConfig.icon}
					{getStatusLabel(ticket.status)}
				</span>
			</div>

			{/* Ticket Details — grid matching account page */}
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
				<InfoField label={t('referenceCode')} value={ticket.reference_code} />
				<InfoField label={t('ticketType')} value={tier?.ticket_name || 'N/A'} />
				{tier && (
					<InfoField label={t('ticketPrice')} value={`${formatPrice(tier.price)} VND`} />
				)}
				<InfoField
					label={t('purchaseDate')}
					value={new Date(ticket.created_at).toLocaleDateString('vi-VN')}
				/>
			</div>

			{/* Status-specific content */}
			{ticket.status === 'pending' && (
				<div className='mt-6 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-4'>
					<p className='text-sm text-amber-800'>{t('completePayment')}</p>
					<div className='flex gap-3 mt-3'>
						<button
							onClick={() => router.push(`/ticket/purchase/${tier?.id}`)}
							className='flex-1 py-2.5 px-4 rounded-xl btn-primary font-medium'
						>
							{t('payNow')}
						</button>
						<button
							onClick={() => setShowCancelDialog(true)}
							disabled={cancelTicketMutation.isPending}
							className='py-2.5 px-4 rounded-xl border border-red-400 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{cancelTicketMutation.isPending ? tCommon('processing') : tCommon('cancel')}
						</button>
					</div>
				</div>
			)}

			{ticket.status === 'self_confirmed' && (
				<div className='mt-6 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-4'>
					<p className='text-sm text-blue-800'>{t('paymentReceived')}</p>
					<p className='text-xs text-blue-600 mt-1'>{t('verificationTime')}</p>
					<button
						onClick={() => setShowCancelDialog(true)}
						disabled={cancelTicketMutation.isPending}
						className='mt-3 w-full py-2.5 px-4 rounded-xl border border-red-400 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{cancelTicketMutation.isPending ? tCommon('processing') : tCommon('cancel')}
					</button>
				</div>
			)}

			{ticket.status === 'denied' && (
				<div className='mt-6 rounded-xl border border-red-200 bg-red-50/50 px-4 py-4'>
					<p className='text-sm text-red-800 mb-2'>{t('ticketDenied')}</p>
					{ticket.denial_reason && (
						<p className='text-sm text-red-700'>
							<strong>{t('denialReason')}:</strong> {ticket.denial_reason}
						</p>
					)}
					<button
						onClick={() => router.push('/ticket')}
						className='mt-3 py-2.5 px-4 rounded-xl btn-primary font-medium'
					>
						{t('tryAnotherTicket')}
					</button>
				</div>
			)}

			{/* Upgrade Rejection Notice */}
			{ticket.status === 'approved' && ticket.upgrade_denial_reason && (
				<div className='mt-6 rounded-xl border border-orange-200 bg-orange-50/50 px-4 py-4'>
					<div className='flex items-start gap-2'>
						<AlertCircle className='w-5 h-5 text-orange-600 shrink-0 mt-0.5' />
						<div>
							<p className='text-sm font-medium text-orange-800'>
								{t('upgradeRejected') || 'Your upgrade request was rejected'}
							</p>
							<p className='text-sm text-orange-700 mt-1'>
								{ticket.upgrade_denial_reason}
							</p>
							<p className='text-xs text-orange-600 mt-2'>
								{t('upgradeRejectedKeepTicket') || 'Your original ticket has been restored. You can try upgrading again.'}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Upgrade Button */}
			{ticket.status === 'approved' && tier && (
				<div className='mt-6 pt-5 border-t border-[#48715B]/15'>
					<button
						onClick={() => setShowUpgradeModal(true)}
						className='shadow-md w-full py-2.5 px-4 text-xl rounded-xl btn-primary font-medium transition-colors duration-200 flex items-center justify-center gap-2'
					>
						<ArrowUpCircle className='w-5 h-5' />
						{t('upgradeTicket')}
					</button>
				</div>
			)}

			{/* Upgrade Modal */}
			{showUpgradeModal && tier && (
				<UpgradeTicketModal
					currentTier={tier}
					onClose={() => setShowUpgradeModal(false)}
				/>
			)}

			{/* Cancel Confirmation Dialog */}
			{showCancelDialog && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl'>
						<h3 className='text-xl font-semibold text-text-primary mb-4'>
							{t('confirmCancelTicket')}
						</h3>
						<p className='text-text-secondary mb-6'>
							{t('confirmCancelTicketDesc') ||
								'Bạn có chắc chắn muốn hủy vé này không? Số lượng vé sẽ được hoàn lại và bạn có thể mua vé mới.'}
						</p>
						<div className='flex gap-3'>
							<button
								onClick={() => setShowCancelDialog(false)}
								disabled={cancelTicketMutation.isPending}
								className='flex-1 py-2.5 px-4 rounded-xl border border-[#8C8C8C]/40 font-medium hover:bg-[#E2EEE2] disabled:opacity-50'
							>
								{tCommon('cancel')}
							</button>
							<button
								onClick={handleCancelTicket}
								disabled={cancelTicketMutation.isPending}
								className='flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50'
							>
								{cancelTicketMutation.isPending
									? tCommon('processing')
									: t('confirmCancel') || 'Xác nhận hủy'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default MyTicketDisplay
