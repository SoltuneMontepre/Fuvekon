'use client'

import React, { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import Image from 'next/image'
import CollapsibleScroll from '@/components/animated/CollapsibleScroll'
import Separator from '@/components/common/scroll/Separator'
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

const TicketPurchasePage = ({ params }: TicketPurchasePageProps): React.ReactElement => {
	use(params)
	const router = useRouter()
	const t = useTranslations('ticket')
	const tCommon = useTranslations('common')
	const [copied, setCopied] = useState<string | null>(null)
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)

	const { data: ticketData, isLoading, error } = useGetMyTicket()
	const confirmMutation = useConfirmPayment()

	const ticket = ticketData?.data

	// Redirect if ticket is already confirmed or approved
	useEffect(() => {
		if (ticket && (ticket.status === 'self_confirmed' || ticket.status === 'approved')) {
			router.push('/account/ticket')
		}
	}, [ticket, router])

	// Copy to clipboard helper
	const copyToClipboard = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setCopied(field)
			setTimeout(() => setCopied(null), 2000)
			toast.success(t('copiedToClipboard') || 'Copied to clipboard!')
		} catch {
			// Fallback for older browsers
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
		try {
			const result = await confirmMutation.mutateAsync()
			if (result.isSuccess) {
				toast.success(t('paymentConfirmed') || 'Payment confirmed successfully!')
				// Redirect to ticket page to see ticket status
				router.push('/account/ticket')
			}
		} catch (error) {
			toast.error(t('paymentConfirmError') || 'Failed to confirm payment. Please try again.')
		}
	}

	if (isLoading) {
		return <Loading />
	}

	if (error || !ticket) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
					<p className='text-red-600 text-xl mb-4'>{t('ticketNotFound')}</p>
					<button
						onClick={() => router.push('/ticket')}
						className='px-6 py-2 bg-[#48715b] text-white rounded-lg hover:bg-[#3a5a4a]'
					>
						{t('backToTicket')}
					</button>
				</div>
			</div>
		)
	}

	// If ticket is denied, show message
	if (ticket.status === 'denied') {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
					<p className='text-red-600 text-xl mb-4'>{t('ticketDenied')}</p>
					{ticket.denial_reason && (
						<p className='text-gray-600 mb-4'>
							{t('denialReason')}: {ticket.denial_reason}
						</p>
					)}
					<button
						onClick={() => router.push('/ticket')}
						className='px-6 py-2 bg-[#48715b] text-white rounded-lg hover:bg-[#3a5a4a]'
					>
						{t('tryAnotherTicket')}
					</button>
				</div>
			</div>
		)
	}

	const tier = ticket.tier
	const price = tier?.price || 0

	return (
		<>
			<Background />
			<div className='min-h-screen relative z-10 py-12 px-4'>
				<div className='max-w-2xl mx-auto'>
					<CollapsibleScroll initialOpen>
						<h3 className="scroll-title pt-5 josefin bg-[url('/textures/asfalt-dark.png')] bg-scroll-title bg-clip-text text-transparent">
							{t('payment')}
						</h3>
						<Separator className='w-[95%] mx-auto' />

						<div className='px-6 py-6'>
							{/* Ticket Info Summary */}
							<div className='bg-[#d2ddd2] rounded-lg p-4 mb-6'>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-[#48715b]'>{t('ticketType')}</p>
										<p className='font-semibold text-[#154c5b]'>{tier?.ticket_name || 'N/A'}</p>
									</div>
									<div>
										<p className='text-sm text-[#48715b]'>{t('amount')}</p>
										<p className='font-semibold text-[#154c5b] text-xl'>
											{formatPrice(price)} VND
										</p>
									</div>
									<div className='col-span-2'>
										<p className='text-sm text-[#48715b]'>{t('referenceCode')}</p>
										<div className='flex items-center gap-2'>
											<p className='font-mono font-bold text-[#154c5b] text-lg'>
												{ticket.reference_code}
											</p>
											<button
												onClick={() => copyToClipboard(ticket.reference_code, 'reference')}
												className='p-1 hover:bg-[#c2cdc2] rounded transition-colors'
												title={tCommon('copy')}
											>
												{copied === 'reference' ? (
													<Check className='w-4 h-4 text-green-600' />
												) : (
													<Copy className='w-4 h-4 text-[#48715b]' />
												)}
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* QR Code */}
							<div className='flex flex-col md:flex-row gap-6 mb-6'>
								<div className='flex-shrink-0'>
									<div className='w-48 h-48 bg-white rounded-lg border-2 border-[#548780] p-2 flex items-center justify-center'>
										<Image
											src='/images/qr.png'
											alt={t('qrTransfer')}
											width={176}
											height={176}
											className='w-full h-full object-contain'
										/>
									</div>
								</div>

								{/* Bank Details */}
								<div className='flex-1'>
									<h4 className='font-semibold text-[#154c5b] mb-3'>{t('bankDetails')}:</h4>
									<div className='space-y-3'>
										<div>
											<p className='text-sm text-[#48715b]'>{t('bankName')}</p>
											<p className='font-medium text-[#154c5b]'>{BANK_DETAILS.bankName}</p>
										</div>
										<div>
											<p className='text-sm text-[#48715b]'>{t('accountNumber')}</p>
											<div className='flex items-center gap-2'>
												<p className='font-mono font-medium text-[#154c5b]'>
													{BANK_DETAILS.accountNumber}
												</p>
												<button
													onClick={() =>
														copyToClipboard(BANK_DETAILS.accountNumber, 'account')
													}
													className='p-1 hover:bg-[#c2cdc2] rounded transition-colors'
													title={tCommon('copy')}
												>
													{copied === 'account' ? (
														<Check className='w-4 h-4 text-green-600' />
													) : (
														<Copy className='w-4 h-4 text-[#48715b]' />
													)}
												</button>
											</div>
										</div>
										<div>
											<p className='text-sm text-[#48715b]'>{t('accountHolder')}</p>
											<p className='font-medium text-[#154c5b]'>{BANK_DETAILS.accountHolder}</p>
										</div>
									</div>
								</div>
							</div>

							{/* Instructions */}
							<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
								<h4 className='font-semibold text-yellow-800 mb-2'>{t('instructions')}:</h4>
								<ol className='list-decimal list-inside space-y-1 text-sm text-yellow-800'>
									<li>{t('instruction1')}</li>
									<li>{t('instruction2', { amount: formatPrice(price) })}</li>
									<li>{t('instruction3', { code: ticket.reference_code })}</li>
									<li>{t('instruction4')}</li>
									<li>{t('instruction5')}</li>
								</ol>
							</div>

							{/* Confirm Button */}
							<div className='space-y-3'>
								<button
									onClick={() => setShowConfirmDialog(true)}
									disabled={confirmMutation.isPending}
									className={`
										w-full py-4 px-6 rounded-[12px] font-semibold text-lg uppercase tracking-wide
										transition-all duration-200
										shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
										${
											confirmMutation.isPending
												? 'bg-gray-300 text-gray-500 cursor-not-allowed'
												: 'bg-[#7cbc97] text-white hover:bg-[#6aab85] active:translate-y-0.5'
										}
									`}
								>
									{confirmMutation.isPending ? tCommon('processing') : t('iHavePaid')}
								</button>

								<button
									onClick={() => router.push('/account')}
									disabled={confirmMutation.isPending}
									className='w-full py-3 px-6 rounded-[12px] font-semibold text-base border-2 border-[#48715b] text-[#48715b] hover:bg-[#e9f5e7] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{tCommon('cancel')}
								</button>
							</div>

							<p className='text-center text-sm text-[#48715b] mt-4'>{t('clickAfterPayment')}</p>
						</div>

						<div className='pb-5' />
					</CollapsibleScroll>
				</div>
			</div>

			{/* Confirmation Dialog */}
			{showConfirmDialog && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl'>
						<h3 className='text-xl font-semibold text-[#154c5b] mb-4'>{t('confirmPaymentTitle')}</h3>
						<p className='text-[#48715b] mb-6'>
							{t('confirmPaymentDesc', { amount: formatPrice(price), code: ticket.reference_code })}
						</p>
						<div className='flex gap-3'>
							<button
								onClick={() => setShowConfirmDialog(false)}
								className='flex-1 py-2 px-4 rounded-lg border border-[#48715b] text-[#48715b] hover:bg-[#e9f5e7]'
							>
								{tCommon('cancel')}
							</button>
							<button
								onClick={handleConfirmPayment}
								className='flex-1 py-2 px-4 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85]'
							>
								{tCommon('confirm')}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default TicketPurchasePage
