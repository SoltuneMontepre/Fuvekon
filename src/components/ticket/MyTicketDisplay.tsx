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
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { toBlob } from 'html-to-image'
import { compressImage } from '@/utils/imageCompression'
import {
	useGetMyTicket,
	useGetTiers,
	useCancelTicket,
	useUpdateBadgeDetails,
} from '@/hooks/services/ticket/useTicket'
import { useUploadToS3 } from '@/hooks/services/s3/useUploadToS3'
import { useUpdateAvatar } from '@/hooks/services/auth/useAccount'
import UpgradeTicketModal from '@/components/ticket/UpgradeTicketModal'
import TicketNameCardPreview from '@/components/ticket/TicketNameCardPreview'
import Loading from '@/components/common/Loading'
import { useAuthStore } from '@/stores/authStore'
import type { TicketStatus, TicketTier } from '@/types/models/ticket/ticket'

// Format price in VND
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

const formatTierPriceByLocale = (tier: TicketTier, locale: string): string => {
	if (locale === 'vi') return `${formatPriceVnd(Number(tier.price))} VNĐ`
	const usd = Number(tier.price_usd ?? 0)
	if (usd > 0) return formatPriceUsd(usd)
	return `${formatPriceVnd(Number(tier.price))} VND`
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
		bannerGradient:
			'linear-gradient(160deg, #558a72 0%, #3d6e5a 50%, #336055 100%)',
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
		bannerGradient:
			'linear-gradient(160deg, #3e9890 0%, #2e8080 50%, #246e6a 100%)',
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
		bannerGradient:
			'linear-gradient(160deg, #1a4a5a 0%, #153d4d 40%, #0e2e3a 100%)',
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
		bannerGradient:
			'linear-gradient(160deg, #2e1e10 0%, #3a2a14 40%, #2a1a0a 100%)',
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
	const locale = useLocale()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const tAccount = useTranslations('account')

	// next-intl returns the key (e.g. "ticket.nameCard") when missing.
	// Since that string is truthy, `t(...) || fallback` won't work—use this helper instead.
	const safeTicket = (key: string, fallback: string) => {
		const val = t(key)
		return val === `ticket.${key}` ? fallback : val
	}
	const safeAccount = (key: string, fallback: string) => {
		const val = tAccount(key)
		return val === `account.${key}` ? fallback : val
	}
	const account = useAuthStore(state => state.account)
	const [showCancelDialog, setShowCancelDialog] = useState(false)
	const [showUpgradeModal, setShowUpgradeModal] = useState(false)
	const [isCancelling, setIsCancelling] = useState(false)
	const cancelDialogRef = useRef<HTMLDialogElement>(null)

	const { data: ticketData, isLoading, error, refetch } = useGetMyTicket()
	const { data: tiersData } = useGetTiers()
	const cancelTicketMutation = useCancelTicket()
	const updateBadgeMutation = useUpdateBadgeDetails()
	const updateAvatarMutation = useUpdateAvatar()
	const namecardCaptureRef = useRef<HTMLDivElement>(null)
	const [namecardUploadProgress, setNamecardUploadProgress] = useState(0)
	const { uploadFile: uploadNamecardToS3, isUploading: isUploadingNamecard } =
		useUploadToS3({
			onProgress: p => setNamecardUploadProgress(p),
		})
	const avatarInputRef = useRef<HTMLInputElement>(null)
	const [avatarUploadProgress, setAvatarUploadProgress] = useState(0)
	const { uploadFile: uploadAvatarToS3, isUploading: isUploadingAvatar } =
		useUploadToS3({
			onProgress: p => setAvatarUploadProgress(p),
		})

	const ticket = ticketData?.data
	const [badgeName, setBadgeName] = useState('')
	const [isFursuiter, setIsFursuiter] = useState(false)
	const [isFursuitStaff, setIsFursuitStaff] = useState(false)
	const [isSavingBadge, setIsSavingBadge] = useState(false)
	// "Standard" users are neither fursuiters nor fursuit staff.
	// (This matches the data we already store on the ticket.)
	const isStandardUser = !isFursuiter && !isFursuitStaff
	const previewName =
		badgeName.trim() ||
		account?.first_name ||
		ticket?.tier?.ticket_name ||
		'Guest'

	// Compute tier rank from full tier list
	const tierTheme = useMemo(() => {
		if (!ticket?.tier || !tiersData?.data) return TIER_THEMES[0]
		const sorted = [...tiersData.data].sort(
			(a, b) => Number(a.price) - Number(b.price)
		)
		const rankIndex = sorted.findIndex(t => t.id === ticket.tier?.id)
		const rank = Math.min(Math.max(rankIndex, 0), TIER_THEMES.length - 1)
		return TIER_THEMES[rank]
	}, [ticket?.tier, tiersData?.data])

	const tierCodeNumber = useMemo(() => {
		const code = ticket?.tier?.tier_code ?? ''
		const match = code.match(/^T(\d+)$/i)
		return match ? Number(match[1]) : 0
	}, [ticket?.tier?.tier_code])

	const canEditNameCard = useMemo(() => {
		// Requirement: user has ticket and ticket tier is >= T2
		return !!ticket && tierCodeNumber >= 2
	}, [ticket, tierCodeNumber])

	const canSaveBadge = useMemo(() => {
		// Backend only allows badge updates when approved.
		return canEditNameCard && ticket?.status === 'approved'
	}, [canEditNameCard, ticket?.status])

	useEffect(() => {
		if (!ticket) return
		setBadgeName(ticket.con_badge_name || account?.first_name || '')
		setIsFursuiter(!!ticket.is_fursuiter)
		setIsFursuitStaff(!!ticket.is_fursuit_staff)
	}, [ticket, account?.first_name])

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
			toast.success(
				t('ticketCancelledSuccess') || 'Ticket cancelled successfully!'
			)
			setShowCancelDialog(false)
			setIsCancelling(false)
		} catch {
			toast.error(
				t('ticketCancelError') || 'Failed to cancel ticket. Please try again.'
			)
			setIsCancelling(false)
		}
	}

	useEffect(() => {
		if (error) {
			toast.error(
				t('couldNotLoadTicket') || 'Could not load ticket information'
			)
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
	const displayName =
		account?.fursona_name ||
		account?.first_name ||
		account?.email?.split('@')[0] ||
		'User'

	const handleAvatarFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0]
		if (avatarInputRef.current) avatarInputRef.current.value = ''
		if (!file) return
		if (!file.type.startsWith('image/')) {
			toast.error(safeAccount('avatarUpdateError', 'Please select an image'))
			return
		}

		try {
			const fileToUpload = await compressImage(file)
			const uploaded = await uploadAvatarToS3(fileToUpload, {
				folder: 'user-uploads',
			})
			await updateAvatarMutation.mutateAsync({ avatar: uploaded.fileUrl })
			toast.success(
				safeAccount(
					'avatarUpdateSuccess',
					'Profile photo updated successfully!'
				)
			)
		} catch {
			toast.error(
				safeAccount(
					'avatarUpdateError',
					'Failed to update profile photo. Please try again.'
				)
			)
		}
	}

	const handleSaveBadge = async () => {
		if (!canSaveBadge) return
		const name = badgeName.trim()
		if (!name) {
			toast.error(t('badgeNameRequired') || 'Please enter a badge name')
			return
		}
		setIsSavingBadge(true)
		try {
			let namecardUrl: string | undefined

			try {
				const node = namecardCaptureRef.current
				if (node && ticket?.reference_code) {
					const blob = await toBlob(node, {
						cacheBust: true,
						pixelRatio: 2,
					})

					if (blob) {
						const file = new File(
							[blob],
							`namecard-${ticket.reference_code}.png`,
							{
								type: 'image/png',
							}
						)

						const uploaded = await uploadNamecardToS3(file, {
							folder: 'namecards',
						})
						namecardUrl = uploaded.fileUrl
					}
				}
			} catch {
				// Non-blocking: still save text/flags even if image capture/upload fails.
			}

			await updateBadgeMutation.mutateAsync({
				con_badge_name: name,
				namecard_url: namecardUrl,
				is_fursuiter: isFursuiter,
				is_fursuit_staff: isFursuitStaff,
			})
			toast.success(t('badgeUpdated') || 'Name card updated')
		} catch {
			toast.error(t('badgeUpdateError') || 'Failed to update name card')
		} finally {
			setIsSavingBadge(false)
		}
	}

	// Themed info field
	const InfoField = ({ label, value }: { label: string; value: string }) => (
		<div
			className='space-y-0.5 px-3 py-2.5 rounded-xl'
			style={{
				background: theme.fieldBg,
				border: `1px solid ${theme.fieldBorder}`,
			}}
		>
			<p
				className='text-sm font-medium'
				style={{ color: theme.fieldLabelColor }}
			>
				{label}
			</p>
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
					style={{
						background:
							'linear-gradient(125deg, rgba(255,255,255,0.07) 0%, transparent 55%)',
					}}
				/>

				<div className='relative z-[1] flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
					<div>
						<h2
							className='text-xl font-bold uppercase tracking-[0.12em]'
							style={{
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
									color: theme.priceColor,
									fontSize: '16px',
								}}
							>
								{tier.ticket_name} — {formatTierPriceByLocale(tier, locale)}
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
					<InfoField
						label={t('ticketType')}
						value={tier?.ticket_name || 'N/A'}
					/>
					{tier && (
						<InfoField
							label={t('ticketPrice')}
							value={formatTierPriceByLocale(tier, locale)}
						/>
					)}
					<InfoField
						label={t('purchaseDate')}
						value={new Date(ticket.created_at).toLocaleDateString('vi-VN')}
					/>
				</div>

				{/* Name Card Editor (Tier >= T2) */}
				{canEditNameCard && (
					<div
						className='mt-6 pt-6 border-t space-y-4'
						style={{ borderColor: `${theme.fieldBorder}` }}
					>
						<div className='flex items-start justify-between gap-3'>
							<div>
								<h3 className='text-lg font-semibold text-text-primary'>
									{safeTicket('nameCard', 'Name card')}
								</h3>
								<p className='text-sm text-text-secondary'>
									{safeTicket(
										'nameCardDesc',
										'Edit your badge details and preview how it will look on your ticket.'
									)}
								</p>
							</div>
							{!canSaveBadge && (
								<span className='text-xs font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-700'>
									{safeTicket(
										'availableAfterApproval',
										'Available after approval'
									)}
								</span>
							)}
						</div>

						<div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-start'>
							{/* Controls */}
							<div
								className='rounded-2xl p-4'
								style={{
									background: theme.fieldBg,
									border: `1px solid ${theme.fieldBorder}`,
								}}
							>
								<label className='block text-sm font-medium text-text-primary mb-2'>
									{safeTicket('badgeName', 'Badge name')}
								</label>
								<input
									value={badgeName}
									onChange={e => {
										setBadgeName(e.target.value)
									}}
									disabled={!canSaveBadge || isSavingBadge}
									placeholder={safeTicket(
										'badgeNamePlaceholder',
										'Your display name'
									)}
									className='w-full px-4 py-3 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10'
									maxLength={255}
								/>

								<div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
									<label className='flex items-center gap-2 text-sm text-text-secondary select-none'>
										<input
											type='checkbox'
											checked={isFursuiter}
											onChange={e => {
												setIsFursuiter(e.target.checked)
											}}
											disabled={!canSaveBadge || isSavingBadge}
											className='accent-black'
										/>
										{t('isFursuiter') || 'Fursuiter'}
									</label>
									<label className='flex items-center gap-2 text-sm text-text-secondary select-none'>
										<input
											type='checkbox'
											checked={isFursuitStaff}
											onChange={e => {
												setIsFursuitStaff(e.target.checked)
											}}
											disabled={!canSaveBadge || isSavingBadge}
											className='accent-black'
										/>
										{t('isFursuitStaff') || 'Fursuit staff'}
									</label>
								</div>

								{/* Change avatar (affects namecard preview) */}
								{!isStandardUser && (
									<div className='mt-4'>
										<input
											ref={avatarInputRef}
											type='file'
											accept='image/*'
											onChange={handleAvatarFileChange}
											disabled={
												isUploadingAvatar || updateAvatarMutation.isPending
											}
											className='hidden'
										/>
										<button
											type='button'
											onClick={() => avatarInputRef.current?.click()}
											disabled={
												!canSaveBadge ||
												isUploadingAvatar ||
												updateAvatarMutation.isPending
											}
											className='w-full py-2.5 px-4 rounded-xl btn-outline font-medium transition-colors duration-200'
										>
											{isUploadingAvatar || updateAvatarMutation.isPending
												? tCommon('processing')
												: safeAccount('changeAvatar', 'Change avatar')}
										</button>
										{isUploadingAvatar && avatarUploadProgress > 0 && (
											<p className='mt-2 text-xs text-text-secondary'>
												{`${Math.round(avatarUploadProgress)}%`}
											</p>
										)}
									</div>
								)}

								<button
									onClick={handleSaveBadge}
									disabled={
										!canSaveBadge || isSavingBadge || isUploadingNamecard
									}
									className='shadow-md mt-4 w-full py-2.5 px-4 text-xl rounded-xl btn-primary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{isSavingBadge || isUploadingNamecard
										? tCommon('processing')
										: safeTicket('saveNameCard', 'Save name card')}
								</button>
								{isUploadingNamecard && (
									<p className='mt-2 text-xs text-text-secondary'>
										{namecardUploadProgress > 0
											? `${Math.round(namecardUploadProgress)}%`
											: ''}
									</p>
								)}
							</div>

							{/* Preview */}
							<div className='rounded-2xl bg-white/60 p-3'>
								<TicketNameCardPreview
									ref={namecardCaptureRef}
									tierCodeNumber={tierCodeNumber}
									avatarUrl={account?.avatar}
									displayName={displayName}
									previewName={previewName}
									referenceCode={ticket.reference_code}
								/>
							</div>
						</div>
					</div>
				)}

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
									style={{
										background:
											'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)',
									}}
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
						<p className='text-xs text-blue-600 mt-1'>
							{t('verificationTime')}
						</p>
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
								style={{
									background:
										'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)',
								}}
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
									{t('upgradeRejectedKeepTicket') ||
										'Your original ticket has been restored. You can try upgrading again.'}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Upgrade Button */}
				{ticket.status === 'approved' && tier && (
					<div
						className='mt-6 pt-5 border-t'
						style={{ borderColor: `${theme.fieldBorder}` }}
					>
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
								style={{
									background:
										'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)',
								}}
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
