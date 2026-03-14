'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	QrCode,
	CheckCircle,
	XCircle,
	User,
	Ticket,
	Loader2,
	LogIn,
} from 'lucide-react'
import { useAdminGetTicketById, useConfirmCheckIn } from '@/hooks/services/ticket/useAdminTicket'
import type { UserTicket } from '@/types/models/ticket/ticket'

const SCANNER_CONTAINER_ID = 'qr-scanner-container'
const SCAN_COOLDOWN_MS = 2000

function parseTicketIdFromScan(raw: string): string {
	const trimmed = raw.trim()
	try {
		if (trimmed.startsWith('http')) {
			const url = new URL(trimmed)
			const segments = url.pathname.split('/').filter(Boolean)
			const last = segments[segments.length - 1]
			return last || trimmed
		}
		if (trimmed.includes('/')) {
			const segments = trimmed.split('/').filter(Boolean)
			return segments[segments.length - 1] || trimmed
		}
	} catch {
		// not a URL
	}
	return trimmed
}

// Reusable info field
const InfoField = ({ label, value }: { label: string; value: string }) => (
	<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
		<p className='text-sm font-medium text-[#48715B]'>{label}</p>
		<p className='text-lg text-text-secondary'>{value}</p>
	</div>
)

export default function ScanTicketPage() {
	const t = useTranslations('admin')
	const tTicket = useTranslations('ticket')
	const tCommon = useTranslations('common')

	const [scannedId, setScannedId] = useState<string | null>(null)
	const [manualCode, setManualCode] = useState('')
	const [scanning, setScanning] = useState(false)
	const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
	const scannerContainerRef = useRef<HTMLDivElement>(null)
	const lastScannedAtRef = useRef(0)
	const manualInputRef = useRef<HTMLInputElement>(null)

	const { data: ticketData, isLoading: ticketLoading } = useAdminGetTicketById(
		scannedId ?? ''
	)
	const confirmCheckIn = useConfirmCheckIn()

	const ticket: UserTicket | null =
		ticketData?.isSuccess && ticketData?.data ? ticketData.data : null

	const startScanner = useCallback(async () => {
		if (scannerRef.current || !scannerContainerRef.current) return
		try {
			const { Html5Qrcode } = await import('html5-qrcode')
			const html5Qr = new Html5Qrcode(SCANNER_CONTAINER_ID)
			scannerRef.current = html5Qr
			const containerWidth = scannerContainerRef.current.offsetWidth
			const qrboxSize = Math.min(260, Math.max(180, containerWidth - 24))
			await html5Qr.start(
				{ facingMode: 'environment' },
				{
					fps: 25,
					qrbox: { width: qrboxSize, height: qrboxSize },
				},
				decodedText => {
					const now = Date.now()
					if (now - lastScannedAtRef.current < SCAN_COOLDOWN_MS) return
					lastScannedAtRef.current = now
					const id = parseTicketIdFromScan(decodedText)
					if (id) {
						setScannedId(id)
						toast.success(t('scanSuccess') || 'Ticket scanned')
					}
				},
				() => {}
			)
			setScanning(true)
		} catch (err) {
			console.error('Scanner start error', err)
			toast.error(t('scanCameraError') || 'Could not access camera')
		}
	}, [t])

	const stopScanner = useCallback(async () => {
		if (scannerRef.current) {
			try {
				await scannerRef.current.stop()
			} catch {
				// ignore
			}
			scannerRef.current = null
			setScanning(false)
		}
	}, [])

	useEffect(() => {
		return () => {
			stopScanner()
		}
	}, [stopScanner])

	const handleScanNext = useCallback(() => {
		setScannedId(null)
		setManualCode('')
		manualInputRef.current?.focus()
	}, [])

	useEffect(() => {
		if (!scannedId) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' || (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey)) {
				const target = e.target as HTMLElement
				if (target?.closest?.('input') || target?.closest?.('textarea')) return
				e.preventDefault()
				handleScanNext()
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [scannedId, handleScanNext])

	const handleManualSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const id = parseTicketIdFromScan(manualCode)
		if (!id) {
			toast.error(t('scanInvalidCode') || 'Please enter a ticket ID or code')
			return
		}
		lastScannedAtRef.current = Date.now()
		setScannedId(id)
	}

	const handleCheckIn = useCallback(() => {
		if (!ticket) return
		confirmCheckIn.mutate(ticket.id, {
			onSuccess: () => {
				toast.success(t('checkInSuccess') || 'Check-in confirmed')
			},
			onError: () => {
				toast.error(t('checkInError') || 'Failed to confirm check-in')
			},
		})
	}, [ticket, confirmCheckIn, t])

	const getStatusLabel = (status: UserTicket['status']) => {
		const labels: Record<UserTicket['status'], string> = {
			pending: tTicket('status.pending'),
			self_confirmed: tTicket('status.selfConfirmed'),
			approved: tTicket('status.approved'),
			denied: tTicket('status.denied'),
			admin_granted: tTicket('status.adminGranted'),
		}
		return labels[status]
	}

	return (
		<div className='w-full max-w-2xl mx-auto'>
			<div className='pb-6 border-b border-[#48715B]/15'>
				<h1 className='text-xl sm:text-2xl font-bold text-text-primary josefin flex items-center gap-2'>
					<QrCode className='w-6 h-6 sm:w-7 sm:h-7 shrink-0' />
					<span className='truncate'>{t('scanTicket')}</span>
				</h1>
				<p className='text-sm sm:text-base text-text-secondary mt-1'>
					{t('scanTicketDesc')}
				</p>
			</div>

			{/* Scanner area */}
			<div className='mt-6 rounded-xl overflow-hidden border border-[#8C8C8C]/15'>
				<div
					id={SCANNER_CONTAINER_ID}
					ref={scannerContainerRef}
					className='min-h-[220px] sm:min-h-[280px] w-full flex items-center justify-center bg-slate-900/50'
				/>
				{!scanning && (
					<div className='p-4 flex justify-center bg-[#E2EEE2]/40'>
						<button
							type='button'
							onClick={startScanner}
							className='inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-xl btn-primary font-medium text-base active:scale-[0.98]'
						>
							<QrCode className='w-5 h-5 shrink-0' />
							{t('startScanner')}
						</button>
					</div>
				)}
				{scanning && (
					<div className='p-4 flex justify-center bg-slate-800/80'>
						<button
							type='button'
							onClick={stopScanner}
							className='inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-xl border-2 border-red-400 text-red-400 hover:bg-red-500/20 font-medium text-base active:scale-[0.98]'
						>
							{t('stopScanner')}
						</button>
					</div>
				)}
			</div>

			{/* Manual entry */}
			<form onSubmit={handleManualSubmit} className='mt-6'>
				<label htmlFor='manual-ticket-input' className='block text-sm font-medium mb-2 text-[#48715B]'>
					{t('manualEntry')}
				</label>
				<div className='flex flex-col sm:flex-row gap-3'>
					<input
						id='manual-ticket-input'
						ref={manualInputRef}
						type='text'
						value={manualCode}
						onChange={e => setManualCode(e.target.value)}
						placeholder={t('manualEntryPlaceholder')}
						className='flex-1 min-h-[48px] px-4 py-3 text-base rounded-xl bg-white border border-[#8C8C8C]/15 text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none focus:border-[#48715B] transition-colors'
						autoComplete='off'
						inputMode='text'
					/>
					<button
						type='submit'
						className='min-h-[48px] px-5 py-3 rounded-xl btn-primary font-medium text-base sm:shrink-0 active:scale-[0.98]'
					>
						{t('lookup')}
					</button>
				</div>
			</form>

			{/* Result */}
			{scannedId && (
				<div className='mt-6 rounded-xl border border-[#8C8C8C]/15 bg-[#E2EEE2]/40 p-4 sm:p-6'>
					{ticketLoading && (
						<div className='flex items-center justify-center gap-2 py-8'>
							<Loader2 className='w-6 h-6 animate-spin text-[#48715B]' />
							<span className='text-sm sm:text-base text-text-secondary'>{tCommon('loading')}</span>
						</div>
					)}
					{ticket && !ticketLoading && (
						<>
							<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-[#48715B]/15'>
								<h2 className='text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2 shrink-0'>
									<Ticket className='w-5 h-5 shrink-0' />
									{t('ticketDetails')}
								</h2>
								<div className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-2'>
									<button
										type='button'
										onClick={handleScanNext}
										className='min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-[#8C8C8C]/40 text-[#48715B] hover:bg-[#E2EEE2] font-medium text-sm sm:text-base active:scale-[0.98]'
										title={t('scanNextHint')}
									>
										{t('scanNext')}
									</button>
									{ticket.status === 'approved' && !ticket.is_checked_in && (
										<button
											type='button'
											onClick={handleCheckIn}
											disabled={confirmCheckIn.isPending}
											className='min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl btn-primary font-medium disabled:opacity-100 disabled:cursor-not-allowed active:scale-[0.98]'
										>
											{confirmCheckIn.isPending ? (
												<Loader2 className='w-5 h-5 animate-spin shrink-0' />
											) : (
												<LogIn className='w-5 h-5 shrink-0' />
											)}
											{t('confirmCheckIn')}
										</button>
									)}
								</div>
							</div>
							<p className='text-xs text-[#8C8C8C] mb-3 hidden sm:block'>
								{t('scanNextKeyboardHint')}
							</p>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<InfoField label={t('code')} value={ticket.reference_code} />
								<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
									<p className='text-sm font-medium text-[#48715B]'>{t('status')}</p>
									<span
										className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium ${
											ticket.status === 'approved'
												? 'bg-green-100 text-green-800'
												: ticket.status === 'denied'
													? 'bg-red-100 text-red-800'
													: 'bg-[#E2EEE2] text-text-secondary'
										}`}
									>
										{ticket.status === 'approved' ? (
											<CheckCircle className='w-4 h-4 shrink-0' />
										) : ticket.status === 'denied' ? (
											<XCircle className='w-4 h-4 shrink-0' />
										) : null}
										{getStatusLabel(ticket.status)}
									</span>
								</div>
								{ticket.tier && (
									<InfoField label={t('type')} value={`${ticket.tier.ticket_name} (${ticket.tier.tier_code})`} />
								)}
								{ticket.is_checked_in && (
									<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200'>
										<div className='flex items-center gap-2 text-green-700'>
											<CheckCircle className='w-4 h-4 shrink-0' />
											<span className='text-sm font-medium'>
												{t('alreadyCheckedIn')}
											</span>
										</div>
									</div>
								)}
							</div>
							{ticket.user && (
								<div className='mt-4 pt-4 border-t border-[#48715B]/15'>
									<div className='flex items-center gap-2 text-sm text-[#48715B] font-medium mb-2'>
										<User className='w-4 h-4 shrink-0' />
										{t('buyer')}
									</div>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
										<InfoField label='Name' value={`${ticket.user.first_name || ''} ${ticket.user.last_name || ''}`.trim() || '–'} />
										<InfoField label='Email' value={ticket.user.email} />
										{ticket.user.fursona_name && (
											<InfoField label={t('fursona')} value={ticket.user.fursona_name} />
										)}
									</div>
								</div>
							)}
						</>
					)}
					{ticketData && !ticketData.isSuccess && !ticketLoading && (
						<div className='flex flex-col items-center gap-2 py-6 text-center px-2'>
							<XCircle className='w-12 h-12 text-red-500 shrink-0' />
							<p className='text-red-600 font-medium text-sm sm:text-base'>
								{t('ticketNotFound')}
							</p>
							<p className='text-sm text-[#8C8C8C]'>
								{t('ticketNotFoundHint')}
							</p>
							<button
								type='button'
								onClick={handleScanNext}
								className='mt-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#8C8C8C]/40 text-[#48715B] hover:bg-[#E2EEE2] font-medium active:scale-[0.98]'
							>
								{t('scanNext')}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
