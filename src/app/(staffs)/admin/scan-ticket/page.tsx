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
} from 'lucide-react'
import { useAdminGetTicketById } from '@/hooks/services/ticket/useAdminTicket'
import type { UserTicket } from '@/types/models/ticket/ticket'

const SCANNER_CONTAINER_ID = 'qr-scanner-container'

function parseTicketIdFromScan(raw: string): string {
	const trimmed = raw.trim()
	// If it looks like a URL, take the last path segment
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
	const [lastScannedAt, setLastScannedAt] = useState<number>(0)
	const scannerRef = useRef<Html5Qrcode | null>(null)
	const scannerContainerRef = useRef<HTMLDivElement>(null)

	const { data: ticketData, isLoading: ticketLoading } = useAdminGetTicketById(
		scannedId ?? ''
	)

	const ticket: UserTicket | null =
		ticketData?.isSuccess && ticketData?.data ? ticketData.data : null

	const startScanner = useCallback(async () => {
		if (scannerRef.current || !scannerContainerRef.current) return
		try {
			const html5Qr = new Html5Qrcode(SCANNER_CONTAINER_ID)
			scannerRef.current = html5Qr
			await html5Qr.start(
				{ facingMode: 'environment' },
				{
					fps: 25,
					qrbox: { width: 260, height: 260 },
				},
				decodedText => {
					// Cooldown to avoid duplicate scans
					const now = Date.now()
					if (now - lastScannedAt < 2000) return
					setLastScannedAt(now)
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
	}, [lastScannedAt, t])

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

	const handleManualSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const id = parseTicketIdFromScan(manualCode)
		if (!id) {
			toast.error(t('scanInvalidCode') || 'Please enter a ticket ID or code')
			return
		}
		setLastScannedAt(Date.now())
		setScannedId(id)
	}

	const handleScanNext = () => {
		setScannedId(null)
		setManualCode('')
		// Refetch not needed; next scan will set new id
	}

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
			className='scan-ticket-page w-full max-w-2xl mx-auto'
		>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold text-[#154c5b] dark:text-dark-text flex items-center gap-2'>
					<QrCode className='w-7 h-7' />
					{t('scanTicket')}
				</h1>
				<p className='text-[#48715b] dark:text-dark-text-secondary mt-1'>
					{t('scanTicketDesc')}
				</p>
			</div>

			{/* Scanner area */}
			<div className='rounded-xl overflow-hidden border border-slate-300/20  mb-6'>
				<div
					id={SCANNER_CONTAINER_ID}
					ref={scannerContainerRef}
					className='min-h-[280px] w-full  flex items-center justify-center'
				/>
				{!scanning && (
					<div className='p-4 flex justify-center '>
						<button
							type='button'
							onClick={startScanner}
							className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85] font-medium'
						>
							<QrCode className='w-4 h-4' />
							{t('startScanner')}
						</button>
					</div>
				)}
				{scanning && (
					<div className='p-4 flex justify-center bg-slate-800/80'>
						<button
							type='button'
							onClick={stopScanner}
							className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-400 hover:bg-red-500/20 font-medium'
						>
							{t('stopScanner')}
						</button>
					</div>
				)}
			</div>

			{/* Manual entry */}
			<form onSubmit={handleManualSubmit} className='mb-6'>
				<label className='block text-sm font-medium mb-2'>
					{t('manualEntry')}
				</label>
				<div className='flex gap-2'>
					<input
						type='text'
						value={manualCode}
						onChange={e => setManualCode(e.target.value)}
						placeholder={t('manualEntryPlaceholder')}
						className='flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97]  dark:text-dark-text'
					/>
					<button
						type='submit'
						className='px-4 py-2 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85] font-medium'
					>
						{t('lookup')}
					</button>
				</div>
			</form>

			{/* Result */}
			{scannedId && (
				<div className='rounded-xl border border-slate-300/20 dark:border-dark-border bg-main/50 dark:bg-dark-surface/50 p-6'>
					{ticketLoading && (
						<div className='flex items-center justify-center gap-2 py-8'>
							<Loader2 className='w-6 h-6 animate-spin text-[#7cbc97]' />
							<span>{tCommon('loading')}</span>
						</div>
					)}
					{ticket && !ticketLoading && (
						<>
							<div className='flex items-center justify-between mb-4'>
								<h2 className='text-lg font-semibold text-[#154c5b] dark:text-dark-text flex items-center gap-2'>
									<Ticket className='w-5 h-5' />
									{t('ticketDetails')}
								</h2>
								<button
									type='button'
									onClick={handleScanNext}
									className='text-sm text-[#7cbc97] hover:underline'
								>
									{t('scanNext')}
								</button>
							</div>
							<div className='space-y-3'>
								<div className='flex items-center gap-2'>
									<span className='text-sm text-gray-600 dark:text-gray-400'>
										{t('code')}:
									</span>
									<span className='font-mono font-medium'>
										{ticket.reference_code}
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='text-sm text-gray-600 dark:text-gray-400'>
										{t('status')}:
									</span>
									<span
										className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${
											ticket.status === 'approved'
												? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
												: ticket.status === 'denied'
													? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
													: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
										}`}
									>
										{ticket.status === 'approved' ? (
											<CheckCircle className='w-4 h-4' />
										) : ticket.status === 'denied' ? (
											<XCircle className='w-4 h-4' />
										) : null}
										{getStatusLabel(ticket.status)}
									</span>
								</div>
								{ticket.tier && (
									<div className='flex items-center gap-2'>
										<span className='text-sm text-gray-600 dark:text-gray-400'>
											{t('type')}:
										</span>
										<span>
											{ticket.tier.ticket_name} ({ticket.tier.tier_code})
										</span>
									</div>
								)}
								{ticket.is_checked_in && (
									<div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
										<CheckCircle className='w-4 h-4' />
										<span className='text-sm font-medium'>
											{t('alreadyCheckedIn')}
										</span>
									</div>
								)}
								{ticket.user && (
									<div className='pt-3 border-t border-slate-200 dark:border-dark-border'>
										<div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1'>
											<User className='w-4 h-4' />
											{t('buyer')}
										</div>
										<div className='pl-6 text-sm'>
											<div>
												{ticket.user.first_name} {ticket.user.last_name}
											</div>
											<div className='text-gray-500 dark:text-gray-400'>
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
						<div className='flex flex-col items-center gap-2 py-6'>
							<XCircle className='w-12 h-12 text-red-500' />
							<p className='text-red-600 dark:text-red-400 font-medium'>
								{t('ticketNotFound')}
							</p>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								{t('ticketNotFoundHint')}
							</p>
							<button
								type='button'
								onClick={handleScanNext}
								className='mt-2 text-sm text-[#7cbc97] hover:underline'
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
