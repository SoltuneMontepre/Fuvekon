'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	RefreshCw,
	ArrowUpCircle,
	ShieldCheck,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	useGetMyTicket,
	useGetTiers,
	useCancelTicket,
} from '@/hooks/services/ticket/useTicket'
import UpgradeTicketModal from '@/components/ticket/UpgradeTicketModal'
import Loading from '@/components/common/Loading'
import type { TicketStatus } from '@/types/models/ticket/ticket'

const SERIF = '"Times New Roman", Times, Baskerville, Georgia, serif'

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
	admin_granted: {
		icon: <ShieldCheck className='w-4 h-4' />,
		textColor: 'text-purple-700',
		pillBg: 'bg-purple-100',
	},
}

// ── Tier theme colors (same rank order as ticket page) ──
interface TierTheme {
	bannerGradient: string
	bannerBorder: string
	accentColor: string
	titleColor: string
	titleShadow?: string
	priceColor: string
	btnBg: string
	btnColor: string
	btnBorder?: string
	btnShadow: string
	fieldBg: string
	fieldBorder: string
	fieldLabelColor: string
}

const TIER_THEMES: TierTheme[] = [
	{
		// Bronze
		bannerGradient: 'linear-gradient(160deg, #558a72 0%, #3d6e5a 50%, #336055 100%)',
		bannerBorder: 'rgba(130,180,120,0.35)',
		accentColor: '#8B6E3A',
		titleColor: '#FFFFFF',
		priceColor: '#e8b860',
		btnBg: 'linear-gradient(160deg, #558a72 0%, #3d6e5a 100%)',
		btnColor: '#d4f0e0',
		btnShadow: '0 3px 14px rgba(0,0,0,0.3)',
		fieldBg: 'rgba(85,138,114,0.08)',
		fieldBorder: 'rgba(85,138,114,0.2)',
		fieldLabelColor: '#3d6e5a',
	},
	{
		// Jade
		bannerGradient: 'linear-gradient(160deg, #3e9890 0%, #2e8080 50%, #246e6a 100%)',
		bannerBorder: 'rgba(100,210,190,0.3)',
		accentColor: '#2c7a60',
		titleColor: '#FFFFFF',
		priceColor: '#f0c84a',
		btnBg: 'linear-gradient(160deg, #3e9890 0%, #2a7878 100%)',
		btnColor: '#b0ede0',
		btnShadow: '0 3px 14px rgba(0,0,0,0.3)',
		fieldBg: 'rgba(62,152,144,0.08)',
		fieldBorder: 'rgba(62,152,144,0.2)',
		fieldLabelColor: '#2a7878',
	},
	{
		// Phoenix
		bannerGradient: 'linear-gradient(160deg, #1a4a5a 0%, #153d4d 40%, #0e2e3a 100%)',
		bannerBorder: 'rgba(220,170,60,0.45)',
		accentColor: '#c9a030',
		titleColor: '#FFFFFF',
		priceColor: '#f0c840',
		btnBg: 'linear-gradient(160deg, #1a4a5a 0%, #153d4d 100%)',
		btnColor: '#f0dca0',
		btnShadow: '0 3px 16px rgba(0,0,0,0.35)',
		fieldBg: 'rgba(26,74,90,0.06)',
		fieldBorder: 'rgba(26,74,90,0.18)',
		fieldLabelColor: '#153d4d',
	},
	{
		// Imperial
		bannerGradient: 'linear-gradient(160deg, #2e1e10 0%, #3a2a14 40%, #2a1a0a 100%)',
		bannerBorder: 'rgba(220,180,60,0.65)',
		accentColor: '#c9a030',
		titleColor: '#f5d060',
		titleShadow: '0 0 20px rgba(240,200,80,0.5)',
		priceColor: '#f5d060',
		btnBg: 'linear-gradient(160deg, #5a4a20 0%, #7a5e28 50%, #5a4a20 100%)',
		btnColor: '#f5e6b8',
		btnBorder: '1px solid rgba(201,168,76,0.6)',
		btnShadow: '0 3px 18px rgba(0,0,0,0.4), 0 0 14px rgba(201,168,76,0.25)',
		fieldBg: 'rgba(90,74,32,0.06)',
		fieldBorder: 'rgba(201,168,76,0.2)',
		fieldLabelColor: '#5a4a20',
	},
]

const MyTicketDisplay = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const [showCancelDialog, setShowCancelDialog] = useState(false)
	const [showUpgradeModal, setShowUpgradeModal] = useState(false)
	const [isCancelling, setIsCancelling] = useState(false)
	const cancelDialogRef = useRef<HTMLDialogElement>(null)

	const { data: ticketData, isLoading, error, refetch } = useGetMyTicket()
	const { data: tiersData } = useGetTiers()
	const cancelTicketMutation = useCancelTicket()

	const ticket = ticketData?.data

	// Compute tier rank from full tier list
	const tierTheme = useMemo(() => {
		if (!ticket?.tier || !tiersData?.data) return TIER_THEMES[0]
		const sorted = [...tiersData.data].sort((a, b) => Number(a.price) - Number(b.price))
		const rankIndex = sorted.findIndex(t => t.id === ticket.tier?.id)
		const rank = Math.min(Math.max(rankIndex, 0), TIER_THEMES.length - 1)
		return TIER_THEMES[rank]
	}, [ticket?.tier, tiersData?.data])

	// Sync native dialog open/close state
	useEffect(() => {
		if (showCancelDialog) {
			cancelDialogRef.current?.showModal()
		} else {
			cancelDialogRef.current?.close()
		}
	}, [showCancelDialog])

	const getStatusLabel = (status: TicketStatus): string => {
		const statusLabels: Record<TicketStatus, string> = {
			pending: t('status.pending'),
			self_confirmed: t('status.selfConfirmed'),
			approved: t('status.approved'),
			denied: t('status.denied'),
			admin_granted: t('status.adminGranted'),
		}
		return statusLabels[status]
	}

	const handleCancelTicket = async () => {
		setIsCancelling(true)
		try {
			await cancelTicketMutation.mutateAsync()
			toast.success(t('ticketCancelledSuccess') || 'Ticket cancelled successfully!')
			setShowCancelDialog(false)
			setIsCancelling(false)
		} catch {
			toast.error(t('ticketCancelError') || 'Failed to cancel ticket. Please try again.')
			setIsCancelling(false)
		}
	}

	useEffect(() => {
		if (error) {
			toast.error(t('couldNotLoadTicket') || 'Could not load ticket information')
		}
	}, [error, t])

	if (isLoading) {
		return <Loading />
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
	const isUpgradedTicket = !!ticket.upgraded_from_tier_id
	const theme = tierTheme

	// Themed info field
	const InfoField = ({ label, value }: { label: string; value: string }) => (
		<div
			className='space-y-0.5 px-3 py-2.5 rounded-xl'
			style={{
				background: theme.fieldBg,
				border: `1px solid ${theme.fieldBorder}`,
			}}
		>
			<p className='text-sm font-medium' style={{ color: theme.fieldLabelColor }}>{label}</p>
			<p className='text-lg text-text-secondary'>{value}</p>
		</div>
	)

	return (
		<div className='overflow-hidden text-text-secondary'>
			{isCancelling && <Loading />}

			{/* ── Tier-colored header banner ── */}
			<div
				className='relative px-6 sm:px-10 py-5 overflow-hidden'
				style={{ background: theme.bannerGradient }}
			>
				{/* Diagonal light sweep */}
				<div
					className='absolute inset-0 pointer-events-none'
					style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.07) 0%, transparent 55%)' }}
				/>

				<div className='relative z-[1] flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
					<div>
						<h2
							className='text-xl font-bold uppercase tracking-[0.12em]'
							style={{
								fontFamily: SERIF,
								color: theme.titleColor,
								textShadow: theme.titleShadow || '0 1px 6px rgba(0,0,0,0.3)',
							}}
						>
							{t('ticketInfo')}
						</h2>
						{tier && (
							<p
								className='font-semibold mt-1 tracking-wide'
								style={{
									fontFamily: SERIF,
									color: theme.priceColor,
									fontSize: '16px',
								}}
							>
								{tier.ticket_name} — {formatPrice(tier.price)} VN{'\u0110'}
							</p>
						)}
					</div>
					<span
						className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.pillBg} ${statusConfig.textColor}`}
					>
						{statusConfig.icon}
						{getStatusLabel(ticket.status)}
					</span>
				</div>
			</div>

			{/* ── Content body ── */}
			<div className='p-6 sm:p-10'>
				{/* Ticket Details — grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
								className='flex-1 py-2.5 px-4 rounded-xl font-medium text-sm uppercase tracking-wide transition-all duration-200 relative overflow-hidden'
								style={{
									background: theme.btnBg,
									color: theme.btnColor,
									border: theme.btnBorder || 'none',
									boxShadow: theme.btnShadow,
								}}
							>
								<span
									className='absolute inset-0 pointer-events-none'
									style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }}
								/>
								<span className='relative z-[1]'>{t('payNow')}</span>
							</button>
							<button
								onClick={() => setShowCancelDialog(true)}
								className='py-2.5 px-4 rounded-xl border border-red-400 text-red-600 font-medium hover:bg-red-50'
							>
								{tCommon('cancel')}
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
							className='mt-3 w-full py-2.5 px-4 rounded-xl border border-red-400 text-red-600 font-medium hover:bg-red-50'
						>
							{tCommon('cancel')}
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
							className='mt-3 py-2.5 px-4 rounded-xl font-medium text-sm uppercase tracking-wide transition-all duration-200 relative overflow-hidden'
							style={{
								background: theme.btnBg,
								color: theme.btnColor,
								border: theme.btnBorder || 'none',
								boxShadow: theme.btnShadow,
							}}
						>
							<span
								className='absolute inset-0 pointer-events-none'
								style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }}
							/>
							<span className='relative z-[1]'>{t('tryAnotherTicket')}</span>
						</button>
					</div>
				)}

				{ticket.status === 'admin_granted' && (
					<div className='mt-6 rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-4'>
						<p className='text-sm text-purple-800'>{t('adminGrantedDesc')}</p>
						<button
							onClick={() => setShowCancelDialog(true)}
							className='mt-3 w-full py-2.5 px-4 rounded-xl border border-red-400 text-red-600 font-medium hover:bg-red-50'
						>
							{tCommon('cancel')}
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
					<div className='mt-6 pt-5 border-t' style={{ borderColor: `${theme.fieldBorder}` }}>
						<button
							onClick={() => setShowUpgradeModal(true)}
							className='w-full py-2.5 px-4 text-xl rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden'
							style={{
								background: theme.btnBg,
								color: theme.btnColor,
								border: theme.btnBorder || 'none',
								boxShadow: theme.btnShadow,
							}}
						>
							<span
								className='absolute inset-0 pointer-events-none'
								style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }}
							/>
							<ArrowUpCircle className='w-5 h-5 relative z-[1]' />
							<span className='relative z-[1]'>{t('upgradeTicket')}</span>
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

				{/* Cancel Confirmation Dialog — native dialog to avoid parent height clipping */}
				<dialog
					ref={cancelDialogRef}
					onCancel={() => setShowCancelDialog(false)}
					className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop:bg-black/50 m-auto'
				>
					<h3 className='text-xl font-semibold text-text-primary mb-4'>
						{t('confirmCancelTicket')}
					</h3>
					<p className='text-text-secondary mb-2'>
						{t('confirmCancelTicketDesc') ||
							'Are you sure you want to cancel this ticket? Your slot will be released and you can purchase a new ticket.'}
					</p>
					{isUpgradedTicket && (
						<p className='text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4'>
							{t('cancelUpgradeWarning')}
						</p>
					)}
					<div className='flex gap-3 mt-6'>
						<button
							onClick={() => setShowCancelDialog(false)}
							className='flex-1 py-2.5 px-4 rounded-xl border border-[#8C8C8C]/40 font-medium hover:bg-[#E2EEE2]'
						>
							{tCommon('cancel')}
						</button>
						<button
							onClick={handleCancelTicket}
							className='flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600'
						>
							{t('confirmCancel') || 'Confirm Cancel'}
						</button>
					</div>
				</dialog>
			</div>
		</div>
	)
}

export default MyTicketDisplay
