'use client'

import React, { useState, use, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Copy, Check, AlertCircle, ArrowUpCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import Image from 'next/image'
import { useGetMyTicket, useConfirmPayment } from '@/hooks/services/ticket/useTicket'
import Background from '@/components/ui/Background'
import Loading from '@/components/common/Loading'

interface TicketPurchasePageProps {
	params: Promise<{ id: string }>
}

// Format price in VND
const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Bank details (placeholder - should come from config)
const BANK_DETAILS = {
	bankName: 'Vietcombank',
	accountNumber: '1234567890',
	accountHolder: 'FUVE CONVENTION',
}

// Reusable info field matching account page style
const InfoField = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
	<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
		<p className='text-sm font-medium text-[#48715B]'>{label}</p>
		<p className={`text-lg text-text-secondary ${mono ? 'font-mono font-bold' : ''}`}>{value}</p>
	</div>
)

// Copyable info field
const CopyableField = ({
	label,
	value,
	field,
	copied,
	onCopy,
	mono,
}: {
	label: string
	value: string
	field: string
	copied: string | null
	onCopy: (text: string, field: string) => void
	mono?: boolean
}) => (
	<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
		<p className='text-sm font-medium text-[#48715B]'>{label}</p>
		<div className='flex items-center gap-2'>
			<p className={`text-lg text-text-secondary ${mono ? 'font-mono font-bold' : ''}`}>{value}</p>
			<button
				onClick={() => onCopy(value, field)}
				className='p-1 hover:bg-[#E2EEE2] rounded-lg transition-colors'
			>
				{copied === field ? (
					<Check className='w-4 h-4 text-green-600' />
				) : (
					<Copy className='w-4 h-4 text-[#8C8C8C]' />
				)}
			</button>
		</div>
	</div>
)

const TicketPurchasePage = ({ params }: TicketPurchasePageProps): React.ReactElement => {
	use(params)
	const router = useRouter()
	const searchParams = useSearchParams()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const [copied, setCopied] = useState<string | null>(null)
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)
	const [isConfirming, setIsConfirming] = useState(false)
	const confirmDialogRef = useRef<HTMLDialogElement>(null)

	const isUpgrade = searchParams?.get('upgrade') === 'true'
	const upgradeDiff = searchParams?.get('diff') ?? null
	const isQueued = searchParams?.get('queued') === '1'

	const { data: ticketData, isLoading, error, refetch } = useGetMyTicket()
	const confirmMutation = useConfirmPayment()
	const [giveUpPolling, setGiveUpPolling] = useState(false)
	const pollingEndRef = useRef(false)

	const ticket = ticketData?.data

	// Sync native dialog
	useEffect(() => {
		if (showConfirmDialog) {
			confirmDialogRef.current?.showModal()
		} else {
			confirmDialogRef.current?.close()
		}
	}, [showConfirmDialog])

	// When landing after a queued purchase (202), poll for ticket until it appears or timeout (e.g. Lambda cold start)
	useEffect(() => {
		if (!isQueued || ticket || giveUpPolling || pollingEndRef.current) return
		refetch()
		const POLL_INTERVAL_MS = 2000
		const MAX_POLL_MS = 30000
		let elapsed = 0
		const interval = setInterval(() => {
			elapsed += POLL_INTERVAL_MS
			refetch()
			if (elapsed >= MAX_POLL_MS) {
				pollingEndRef.current = true
				setGiveUpPolling(true)
			}
		}, POLL_INTERVAL_MS)
		return () => clearInterval(interval)
	}, [isQueued, ticket, giveUpPolling, refetch])

	useEffect(() => {
		if (isUpgrade) return
		if (ticket && (ticket.status === 'self_confirmed' || ticket.status === 'approved')) {
			router.push('/account/ticket')
		}
	}, [ticket, router, isUpgrade])

	const copyToClipboard = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(field)
			setTimeout(() => setCopied(null), 2000)
			toast.success(t('copiedToClipboard') || 'Copied to clipboard!')
		} catch {
			try {
				const textArea = document.createElement('textarea')
				textArea.value = text
				document.body.appendChild(textArea)
				textArea.select()
				document.execCommand('copy')
				document.body.removeChild(textArea)
				setCopied(field)
				setTimeout(() => setCopied(null), 2000)
				toast.success(t('copiedToClipboard') || 'Copied to clipboard!')
			} catch {
				toast.error(t('copyFailed') || 'Failed to copy to clipboard')
			}
		}
	}

	const handleConfirmPayment = async () => {
		setShowConfirmDialog(false)
		setIsConfirming(true)
		try {
			const result = await confirmMutation.mutateAsync()
			if (result.isSuccess) {
				toast.success(t('paymentConfirmed') || 'Payment confirmed successfully!')
				router.push('/account/ticket')
				return // keep loading up through navigation
			}
			setIsConfirming(false)
		} catch {
			toast.error(t('paymentConfirmError') || 'Failed to confirm payment. Please try again.')
			setIsConfirming(false)
		}
	}

	if (isLoading) {
		return <Loading />
	}

	// After a queued purchase (202), worker may still be processing; poll and show "Processing..." until ticket appears or timeout
	if (isQueued && !ticket && !giveUpPolling) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Background />
				<div className='fixed inset-0 z-[1] bg-black/40' />
				<div className='relative z-10 text-center'>
					<Loader2 className='w-12 h-12 text-[#48715b] mx-auto mb-4 animate-spin' />
					<p className='text-text-secondary text-lg mb-4'>{t('purchaseProcessing')}</p>
					<p className='text-text-secondary/80 text-sm'>{t('purchaseProcessingHint')}</p>
				</div>
			</div>
		)
	}

	if (error || !ticket) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='w-12 h-12 text-[#48715b] mx-auto mb-4' />
					<p className='text-text-secondary text-lg mb-4'>{t('ticketNotFound')}</p>
					{isQueued && giveUpPolling && (
						<p className='text-text-secondary/80 text-sm mb-4'>{t('purchaseProcessingTimeoutHint')}</p>
					)}
					<button
						onClick={() => router.push('/ticket')}
						className='px-6 py-2.5 rounded-xl btn-primary font-medium'
					>
						{t('backToTicket')}
					</button>
				</div>
			</div>
		)
	}

	if (ticket.status === 'denied') {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
					<p className='text-red-600 text-lg mb-4'>{t('ticketDenied')}</p>
					{ticket.denial_reason && (
						<p className='text-text-secondary mb-4'>
							{t('denialReason')}: {ticket.denial_reason}
						</p>
					)}
					<button
						onClick={() => router.push('/ticket')}
						className='px-6 py-2.5 rounded-xl btn-primary font-medium'
					>
						{t('tryAnotherTicket')}
					</button>
				</div>
			</div>
		)
	}

	const tier = ticket.tier
	const fullPrice = tier?.price || 0
	const price = isUpgrade && upgradeDiff ? parseFloat(upgradeDiff) : fullPrice

	return (
		<>
			{isConfirming && <Loading />}
			<Background />
			<div className='fixed inset-0 z-[1] bg-black/40' />
			<div className='min-h-screen relative z-10 py-12 px-4'>
				<div className='max-w-2xl mx-auto'>
					<div className='bg-main backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative'>
						{/* Drum pattern overlay */}
						<Image
							src='/assets/common/drum_pattern.webp'
							alt=''
							width={2000}
							height={2000}
							className='absolute inset-0 z-0 opacity-[3%] w-full h-full object-cover pointer-events-none'
							draggable={false}
						/>

						<div className='relative z-10 rounded-[30px] p-6 sm:p-10 text-text-secondary'>
							{/* Title */}
							<div className='pb-6 border-b border-[#48715B]/15'>
								<h2 className='text-2xl font-bold text-text-primary josefin'>
									{t('payment')}
								</h2>
							</div>

							{/* Upgrade Info Banner */}
							{isUpgrade && ticket.previous_reference_code && (
								<div className='mt-6 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-4 flex items-center gap-3'>
									<ArrowUpCircle className='w-5 h-5 text-blue-600 flex-shrink-0' />
									<div>
										<p className='text-blue-800 font-medium'>{t('upgradeFrom')} {ticket.previous_reference_code}</p>
										<p className='text-blue-600 text-sm'>{t('upgradePayDifference')}</p>
									</div>
								</div>
							)}

							{/* Ticket Info Summary */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
								<InfoField label={t('ticketType')} value={tier?.ticket_name || 'N/A'} />
								<InfoField
									label={isUpgrade ? t('upgradePriceDifference') : t('amount')}
									value={`${isUpgrade ? '+' : ''}${formatPrice(price)} VND`}
								/>
								<CopyableField
									label={t('referenceCode')}
									value={ticket.reference_code}
									field='reference'
									copied={copied}
									onCopy={copyToClipboard}
									mono
								/>
							</div>

							{/* QR Code + Bank Details */}
							<div className='mt-6 pt-6 border-t border-[#48715B]/15'>
								<div className='flex flex-col md:flex-row gap-6'>
									<div className='flex-shrink-0 mx-auto md:mx-0'>
										<div className='w-48 h-48 bg-white rounded-xl border border-[#8C8C8C]/15 p-2 flex items-center justify-center'>
											<Image
												src='/images/qr.png'
												alt={t('qrTransfer')}
												width={176}
												height={176}
												className='w-full h-full object-contain'
											/>
										</div>
									</div>

									<div className='flex-1 space-y-3'>
										<h4 className='text-lg font-semibold text-text-primary'>
											{t('bankDetails')}
										</h4>
										<InfoField label={t('bankName')} value={BANK_DETAILS.bankName} />
										<CopyableField
											label={t('accountNumber')}
											value={BANK_DETAILS.accountNumber}
											field='account'
											copied={copied}
											onCopy={copyToClipboard}
											mono
										/>
										<InfoField label={t('accountHolder')} value={BANK_DETAILS.accountHolder} />
									</div>
								</div>
							</div>

							{/* Instructions */}
							<div className='mt-6 rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-4'>
								<h4 className='font-semibold text-amber-800 mb-2'>{t('instructions')}</h4>
								<ol className='list-decimal list-inside space-y-1 text-sm text-amber-800'>
									<li>{t('instruction1')}</li>
									<li>{t('instruction2', { amount: formatPrice(price) })}</li>
									<li>{t('instruction3', { code: ticket.reference_code })}</li>
									<li>{t('instruction4')}</li>
									<li>{t('instruction5')}</li>
								</ol>
							</div>

							{/* Actions */}
							<div className='mt-6 pt-5 border-t border-[#48715B]/15 space-y-3'>
								<button
									onClick={() => setShowConfirmDialog(true)}
									className='shadow-md w-full py-2.5 px-4 text-xl rounded-xl btn-primary font-medium transition-colors duration-200'
								>
									{t('iHavePaid')}
								</button>

								<button
									onClick={() => router.push('/account')}
									className='w-full py-2.5 px-4 rounded-xl border border-[#8C8C8C]/40 font-medium hover:bg-[#E2EEE2] transition-colors duration-200'
								>
									{tCommon('cancel')}
								</button>

								<p className='text-center text-sm text-[#8C8C8C] pt-1'>{t('clickAfterPayment')}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Confirmation Dialog — native dialog for proper stacking */}
			<dialog
				ref={confirmDialogRef}
				onCancel={() => setShowConfirmDialog(false)}
				className='bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop:bg-black/50 m-auto'
			>
				<h3 className='text-xl font-semibold text-text-primary mb-4'>{t('confirmPaymentTitle')}</h3>
				<p className='text-text-secondary mb-6'>
					{t('confirmPaymentDesc', { amount: formatPrice(price), code: ticket.reference_code })}
				</p>
				<div className='flex gap-3'>
					<button
						onClick={() => setShowConfirmDialog(false)}
						className='flex-1 py-2.5 px-4 rounded-xl border border-[#8C8C8C]/40 font-medium hover:bg-[#E2EEE2]'
					>
						{tCommon('cancel')}
					</button>
					<button
						onClick={handleConfirmPayment}
						className='flex-1 py-2.5 px-4 rounded-xl btn-primary font-medium'
					>
						{tCommon('confirm')}
					</button>
				</div>
			</dialog>
		</>
	)
}

export default TicketPurchasePage
