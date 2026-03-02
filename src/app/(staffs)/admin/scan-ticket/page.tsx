'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
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

export default function ScanTicketPage() {
	const t = useTranslations('admin')
	const tTicket = useTranslations('ticket')
	const tCommon = useTranslations('common')

	const [scannedId, setScannedId] = useState<string | null>(null)
	const [manualCode, setManualCode] = useState('')
	const [scanning, setScanning] = useState(false)
	const scannerRef = useRef<Html5Qrcode | null>(null)
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

	// Keyboard: Escape or "n" to scan next when result is visible
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
		}
		return labels[status]
	}

	return (
		<div
			id='scan-ticket-page'
			className='scan-ticket-page w-full max-w-2xl mx-auto px-1 sm:px-0'
		>
			<div className='mb-4 sm:mb-6'>
				<h1 className='text-xl sm:text-2xl font-bold text-[#154c5b] dark:text-dark-text flex items-center gap-2'>
					<QrCode className='w-6 h-6 sm:w-7 sm:h-7 shrink-0' />
					<span className='truncate'>{t('scanTicket')}</span>
				</h1>
				<p className='text-sm sm:text-base text-[#48715b] dark:text-dark-text-secondary mt-1'>
					{t('scanTicketDesc')}
				</p>
			</div>

			{/* Scanner area */}
			<div className='rounded-xl overflow-hidden border border-slate-300/20 dark:border-dark-border/20 mb-4 sm:mb-6'>
				<div
					id={SCANNER_CONTAINER_ID}
					ref={scannerContainerRef}
					className='min-h-[220px] sm:min-h-[280px] w-full flex items-center justify-center bg-slate-900/50'
				/>
				{!scanning && (
					<div className='p-4 flex justify-center'>
						<button
							type='button'
							onClick={startScanner}
							className='inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-xl bg-[#7cbc97] text-white hover:bg-[#6aab85] font-medium text-base touch-manipulative active:scale-[0.98]'
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
							className='inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-xl border-2 border-red-400 text-red-400 hover:bg-red-500/20 font-medium text-base touch-manipulative active:scale-[0.98]'
						>
							{t('stopScanner')}
						</button>
					</div>
				)}
			</div>

			{/* Manual entry */}
			<form onSubmit={handleManualSubmit} className='mb-4 sm:mb-6'>
				<label htmlFor='manual-ticket-input' className='block text-sm font-medium mb-2 text-[#154c5b] dark:text-dark-text'>
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
						className='flex-1 min-h-[48px] px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:border-dark-border dark:bg-dark-surface dark:text-dark-text'
						autoComplete='off'
						inputMode='text'
					/>
					<button
						type='submit'
						className='min-h-[48px] px-5 py-3 rounded-xl bg-[#7cbc97] text-white hover:bg-[#6aab85] font-medium text-base touch-manipulative sm:shrink-0 active:scale-[0.98]'
					>
						{t('lookup')}
					</button>
				</div>
			</form>

			{/* Result */}
			{scannedId && (
				<div className='rounded-xl border border-slate-300/20 dark:border-dark-border bg-main/50 dark:bg-dark-surface/50 p-4 sm:p-6'>
					{ticketLoading && (
						<div className='flex items-center justify-center gap-2 py-8'>
							<Loader2 className='w-6 h-6 animate-spin text-[#7cbc97]' />
							<span className='text-sm sm:text-base'>{tCommon('loading')}</span>
						</div>
					)}
					{ticket && !ticketLoading && (
						<>
							<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4'>
								<h2 className='text-base sm:text-lg font-semibold text-[#154c5b] dark:text-dark-text flex items-center gap-2 shrink-0'>
									<Ticket className='w-5 h-5 shrink-0' />
									{t('ticketDetails')}
								</h2>
								<div className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-2'>
									<button
										type='button'
										onClick={handleScanNext}
										className='min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-[#7cbc97] hover:bg-[#7cbc97]/10 font-medium text-sm sm:text-base touch-manipulative active:scale-[0.98]'
										title={t('scanNextHint')}
									>
										{t('scanNext')}
									</button>
									{/* Check-in: only for approved tickets not yet checked in */}
									{ticket.status === 'approved' && !ticket.is_checked_in && (
										<button
											type='button'
											onClick={handleCheckIn}
											disabled={confirmCheckIn.isPending}
											className='min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#154c5b] text-white hover:bg-[#0f3a45] font-medium disabled:opacity-60 disabled:cursor-not-allowed touch-manipulative active:scale-[0.98]'
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
							<p className='text-xs text-gray-500 dark:text-gray-400 mb-3 hidden sm:block'>
								{t('scanNextKeyboardHint')}
							</p>
							<div className='space-y-3'>
								<div className='flex flex-wrap items-center gap-2'>
									<span className='text-sm text-gray-600 dark:text-gray-400 shrink-0'>
										{t('code')}:
									</span>
									<span className='font-mono font-medium text-sm sm:text-base break-all'>
										{ticket.reference_code}
									</span>
								</div>
								<div className='flex flex-wrap items-center gap-2'>
									<span className='text-sm text-gray-600 dark:text-gray-400 shrink-0'>
										{t('status')}:
									</span>
									<span
										className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium ${
											ticket.status === 'approved'
												? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
												: ticket.status === 'denied'
													? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
													: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
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
									<div className='flex flex-wrap items-center gap-2'>
										<span className='text-sm text-gray-600 dark:text-gray-400 shrink-0'>
											{t('type')}:
										</span>
										<span className='text-sm sm:text-base'>
											{ticket.tier.ticket_name} ({ticket.tier.tier_code})
										</span>
									</div>
								)}
								{ticket.is_checked_in && (
									<div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
										<CheckCircle className='w-4 h-4 shrink-0' />
										<span className='text-sm font-medium'>
											{t('alreadyCheckedIn')}
										</span>
									</div>
								)}
								{ticket.user && (
									<div className='pt-3 border-t border-slate-200 dark:border-dark-border'>
										<div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1'>
											<User className='w-4 h-4 shrink-0' />
											{t('buyer')}
										</div>
										<div className='pl-6 text-sm space-y-0.5 break-words'>
											<div>
												{ticket.user.first_name} {ticket.user.last_name}
											</div>
											<div className='text-gray-500 dark:text-gray-400 break-all'>
												{ticket.user.email}
											</div>
											{ticket.user.fursona_name && (
												<div className='text-gray-500 dark:text-gray-400'>
													{t('fursona')}: {ticket.user.fursona_name}
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</>
					)}
					{ticketData && !ticketData.isSuccess && !ticketLoading && (
						<div className='flex flex-col items-center gap-2 py-6 text-center px-2'>
							<XCircle className='w-12 h-12 text-red-500 shrink-0' />
							<p className='text-red-600 dark:text-red-400 font-medium text-sm sm:text-base'>
								{t('ticketNotFound')}
							</p>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								{t('ticketNotFoundHint')}
							</p>
							<button
								type='button'
								onClick={handleScanNext}
								className='mt-2 min-h-[44px] px-4 py-2.5 rounded-xl text-[#7cbc97] hover:bg-[#7cbc97]/10 font-medium touch-manipulative active:scale-[0.98]'
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
