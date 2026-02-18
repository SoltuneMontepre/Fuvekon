'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
	CheckCircle,
	XCircle,
	Clock,
	RefreshCw,
	Search,
	Filter,
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	Plus,
	ChevronDown,
	ChevronUp,
	Pencil,
	Trash2,
	Power,
	PowerOff,
	Ticket,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	useAdminGetTickets,
	useGetTicketStatistics,
	useApproveTicket,
	useDenyTicket,
	useCreateTicket,
	useCreateTier,
	useAdminGetTiers,
	useUpdateTier,
	useDeleteTier,
	useActivateTier,
	useDeactivateTier,
	type AdminTicketFilter,
} from '@/hooks/services/ticket/useAdminTicket'
import { useGetTiers } from '@/hooks/services/ticket/useTicket'
import type {
	TicketStatus,
	UserTicket,
	TicketTier,
	TierStatistics,
} from '@/types/models/ticket/ticket'
import type { PaginationMeta } from '@/types/api/ticket/ticket'
import { useGetMe } from '@/hooks/services/auth/useAccount'
import { logger } from '@/utils/logger'
import Loading from '@/components/common/Loading'

// Format price in VND
const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Status display configuration (icons only, labels come from translations)
const STATUS_ICONS: Record<
	TicketStatus,
	{ icon: React.ReactNode; bgColor: string; textColor: string }
> = {
	pending: {
		icon: <Clock className='w-4 h-4' />,
		bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
		textColor: 'text-yellow-700 dark:text-yellow-400',
	},
	self_confirmed: {
		icon: <RefreshCw className='w-4 h-4' />,
		bgColor: 'bg-blue-100 dark:bg-blue-900/30',
		textColor: 'text-blue-700 dark:text-blue-400',
	},
	approved: {
		icon: <CheckCircle className='w-4 h-4' />,
		bgColor: 'bg-green-100 dark:bg-green-900/30',
		textColor: 'text-green-700 dark:text-green-400',
	},
	denied: {
		icon: <XCircle className='w-4 h-4' />,
		bgColor: 'bg-red-100 dark:bg-red-900/30',
		textColor: 'text-red-700 dark:text-red-400',
	},
}

const TicketManagementPage = (): React.ReactElement => {
	const router = useRouter()
	const t = useTranslations('admin')
	const tTicket = useTranslations('ticket')
	const tCommon = useTranslations('common')

	const { data: meData, isLoading: meLoading } = useGetMe()
	const isAdmin =
		meData?.isSuccess && meData.data?.role?.toLowerCase() === 'admin'

	// Restrict this page to admin only; redirect staff to admin home
	useEffect(() => {
		if (meLoading) return
		if (meData?.isSuccess && meData.data && !isAdmin) {
			router.replace('/admin')
		}
	}, [meLoading, meData, isAdmin, router])

	// Get status label from translations
	const getStatusLabel = (status: TicketStatus): string => {
		const statusLabels: Record<TicketStatus, string> = {
			pending: tTicket('status.pending'),
			self_confirmed: tTicket('status.selfConfirmed'),
			approved: tTicket('status.approved'),
			denied: tTicket('status.denied'),
		}
		return statusLabels[status]
	}

	// Filter state
	const [filter, setFilter] = useState<AdminTicketFilter>({
		page: 1,
		page_size: 20,
	})
	const [searchInput, setSearchInput] = useState('')
	const [showDenyDialog, setShowDenyDialog] = useState(false)
	const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null)
	const [denyReason, setDenyReason] = useState('')
	const [createUserId, setCreateUserId] = useState('')
	const [createTierId, setCreateTierId] = useState('')
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [showCreateTierForm, setShowCreateTierForm] = useState(false)
	const [tierName, setTierName] = useState('')
	const [tierDescription, setTierDescription] = useState('')
	const [tierBenefitsText, setTierBenefitsText] = useState('')
	const [tierPrice, setTierPrice] = useState('')
	const [tierStock, setTierStock] = useState('')
	const [tierIsActive, setTierIsActive] = useState(true)
	const [editTierModal, setEditTierModal] = useState<TicketTier | null>(null)
	const [editTierName, setEditTierName] = useState('')
	const [editTierDescription, setEditTierDescription] = useState('')
	const [editTierBenefitsText, setEditTierBenefitsText] = useState('')
	const [editTierPrice, setEditTierPrice] = useState('')
	const [editTierStock, setEditTierStock] = useState('')
	const [editTierIsActive, setEditTierIsActive] = useState(true)

	// Auto-filter on search input (3+ characters)
	useEffect(() => {
		if (searchInput.length >= 3 || searchInput.length === 0) {
			const timeoutId = setTimeout(() => {
				setFilter(prev => ({
					...prev,
					search: searchInput || undefined,
					page: 1,
				}))
			}, 300) // Debounce 300ms

			return () => clearTimeout(timeoutId)
		}
	}, [searchInput])

	// Queries
	const {
		data: ticketsData,
		isLoading: ticketsLoading,
		refetch: refetchTickets,
	} = useAdminGetTickets(filter)
	const { data: statsData, isLoading: statsLoading } = useGetTicketStatistics()
	const { data: tiersData } = useGetTiers()

	// Mutations
	const approveMutation = useApproveTicket()
	const denyMutation = useDenyTicket()
	const createTicketMutation = useCreateTicket()
	const createTierMutation = useCreateTier()
	const { data: adminTiersData } = useAdminGetTiers()
	const updateTierMutation = useUpdateTier()
	const deleteTierMutation = useDeleteTier()
	const activateTierMutation = useActivateTier()
	const deactivateTierMutation = useDeactivateTier()

	const tickets = ticketsData?.data || []
	const stats = statsData?.data
	const tiers = tiersData?.data || []
	const adminTiers: TicketTier[] = adminTiersData?.data || []
	const pagination: PaginationMeta | undefined = ticketsData?.meta as
		| PaginationMeta
		| undefined

	// Handle search
	const handleSearch = () => {
		setFilter(prev => ({
			...prev,
			search: searchInput || undefined,
			page: 1,
		}))
	}

	// Handle filter change
	const handleStatusFilter = (
		status: TicketStatus | 'all' | 'pending_over_24'
	) => {
		if (status === 'all') {
			setFilter(prev => ({
				...prev,
				status: undefined,
				pending_over_24: undefined,
				page: 1,
			}))
		} else if (status === 'pending_over_24') {
			setFilter(prev => ({
				...prev,
				status: 'self_confirmed',
				pending_over_24: true,
				page: 1,
			}))
		} else {
			setFilter(prev => ({
				...prev,
				status,
				pending_over_24: undefined,
				page: 1,
			}))
		}
	}

	// Handle tier filter
	const handleTierFilter = (tierId: string) => {
		setFilter(prev => ({
			...prev,
			tier_id: tierId || undefined,
			page: 1,
		}))
	}

	// Handle approve
	const handleApprove = async (ticket: UserTicket) => {
		try {
			await approveMutation.mutateAsync(ticket.id)
			toast.success(t('ticketApproved') || 'Ticket approved successfully')
		} catch (error) {
			logger.error('Failed to approve ticket', error, { ticketId: ticket.id })
			toast.error(
				t('approveError') || 'Failed to approve ticket. Please try again.'
			)
		}
	}

	// Handle deny
	const handleDenyClick = (ticket: UserTicket) => {
		setSelectedTicket(ticket)
		setDenyReason('')
		setShowDenyDialog(true)
	}

	const handleDenyConfirm = async () => {
		if (!selectedTicket) return
		try {
			await denyMutation.mutateAsync({
				ticketId: selectedTicket.id,
				reason: denyReason || undefined,
			})
			setShowDenyDialog(false)
			setSelectedTicket(null)
			toast.success(t('ticketDenied') || 'Ticket denied successfully')
		} catch (error) {
			logger.error('Failed to deny ticket', error, {
				ticketId: selectedTicket.id,
			})
			toast.error(t('denyError') || 'Failed to deny ticket. Please try again.')
		}
	}

	// Pagination
	const handlePageChange = (page: number) => {
		setFilter(prev => ({ ...prev, page }))
	}

	// Create ticket
	const handleCreateTicket = async () => {
		if (!createUserId.trim() || !createTierId) {
			toast.error(
				t('createTicketError') || 'Please enter User ID and select a tier.'
			)
			return
		}
		try {
			await createTicketMutation.mutateAsync({
				userId: createUserId.trim(),
				tierId: createTierId,
			})
			toast.success(t('createTicketSuccess') || 'Ticket created successfully')
			setCreateUserId('')
			setCreateTierId('')
			setShowCreateForm(false)
		} catch (error) {
			logger.error('Failed to create ticket', error)
			toast.error(
				t('createTicketError') || 'Failed to create ticket. Please try again.'
			)
		}
	}

	const handleCreateTier = async () => {
		const name = tierName.trim()
		const priceNum = Number(tierPrice)
		const stockNum = parseInt(tierStock, 10)
		if (
			!name ||
			Number.isNaN(priceNum) ||
			priceNum < 0 ||
			Number.isNaN(stockNum) ||
			stockNum < 0
		) {
			toast.error(
				t('createTierError') || 'Please fill name, price (≥0), and stock (≥0).'
			)
			return
		}
		const benefits = tierBenefitsText
			.split('\n')
			.map(s => s.trim())
			.filter(Boolean)
		try {
			await createTierMutation.mutateAsync({
				ticket_name: name,
				description: tierDescription.trim() ?? '',
				benefits,
				price: priceNum,
				stock: stockNum,
				is_active: tierIsActive,
			})
			toast.success(
				t('createTierSuccess') || 'Ticket tier created successfully'
			)
			setTierName('')
			setTierDescription('')
			setTierBenefitsText('')
			setTierPrice('')
			setTierStock('')
			setTierIsActive(true)
			setShowCreateTierForm(false)
		} catch (error: unknown) {
			logger.error('Failed to create tier', error)
			const msg =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message ||
				t('createTierError') ||
				'Failed to create ticket tier.'
			toast.error(msg)
		}
	}

	const openEditTierModal = (tier: TicketTier) => {
		setEditTierModal(tier)
		setEditTierName(tier.ticket_name)
		setEditTierDescription(tier.description || '')
		setEditTierBenefitsText(
			Array.isArray(tier.benefits) ? tier.benefits.join('\n') : ''
		)
		setEditTierPrice(String(tier.price))
		setEditTierStock(String(tier.stock))
		setEditTierIsActive(tier.is_active)
	}

	const handleUpdateTier = async () => {
		if (!editTierModal) return
		const priceNum = Number(editTierPrice)
		const stockNum = parseInt(editTierStock, 10)
		if (
			Number.isNaN(priceNum) ||
			priceNum < 0 ||
			Number.isNaN(stockNum) ||
			stockNum < 0
		) {
			toast.error(t('createTierError') || 'Invalid price or stock.')
			return
		}
		const benefits = editTierBenefitsText
			.split('\n')
			.map(s => s.trim())
			.filter(Boolean)
		try {
			await updateTierMutation.mutateAsync({
				tierId: editTierModal.id,
				payload: {
					ticket_name: editTierName.trim() || undefined,
					description: editTierDescription.trim() || undefined,
					benefits: benefits.length > 0 ? benefits : undefined,
					price: priceNum,
					stock: stockNum,
					is_active: editTierIsActive,
				},
			})
			toast.success(t('tierUpdated') || 'Tier updated successfully')
			setEditTierModal(null)
		} catch (error) {
			logger.error('Failed to update tier', error)
			toast.error(t('createTierError') || 'Failed to update tier.')
		}
	}

	const handleDeleteTier = async (tier: TicketTier) => {
		if (
			!confirm(
				t('confirmDeleteTier') ||
					`Delete tier "${tier.ticket_name}"? This cannot be undone.`
			)
		)
			return
		try {
			await deleteTierMutation.mutateAsync(tier.id)
			toast.success(t('tierDeleted') || 'Tier deleted successfully')
		} catch (error) {
			logger.error('Failed to delete tier', error)
			toast.error(t('createTierError') || 'Failed to delete tier.')
		}
	}

	const handleActivateTier = async (tier: TicketTier) => {
		try {
			await activateTierMutation.mutateAsync(tier.id)
			toast.success(t('tierActivated') || 'Tier activated')
		} catch (error) {
			logger.error('Failed to activate tier', error)
			toast.error(t('createTierError') || 'Failed to activate tier.')
		}
	}

	const handleDeactivateTier = async (tier: TicketTier) => {
		try {
			await deactivateTierMutation.mutateAsync(tier.id)
			toast.success(t('tierDeactivated') || 'Tier deactivated')
		} catch (error) {
			logger.error('Failed to deactivate tier', error)
			toast.error(t('createTierError') || 'Failed to deactivate tier.')
		}
	}

	// Admin only: show loading or empty while redirecting staff
	if (meLoading) return <Loading />
	if (meData?.isSuccess && meData.data && !isAdmin)
		return <div aria-hidden className='sr-only' />

	return (
		<div id='ticket-management-page' className='ticket-management-page w-full'>
			{/* Header */}
			<div
				id='ticket-management-header'
				className='ticket-management-header mb-6 flex flex-wrap items-center justify-between gap-4'
			>
				<div>
					<h1 className='text-2xl font-bold text-[#154c5b] dark:text-dark-text flex items-center gap-2'>
						<Ticket className='w-6 h-6' />
						{t('ticketManagement')}
					</h1>
					<p className='text-[#48715b] dark:text-dark-text-secondary mt-1'>
						{t('ticketManagementDesc')}
					</p>
				</div>
				<div className='flex flex-wrap gap-2'>
					<button
						type='button'
						onClick={() => setShowCreateForm(prev => !prev)}
						className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85] font-medium'
					>
						<Plus className='w-4 h-4' />
						{t('createTicket')}
						{showCreateForm ? (
							<ChevronUp className='w-4 h-4' />
						) : (
							<ChevronDown className='w-4 h-4' />
						)}
					</button>
					<button
						type='button'
						onClick={() => setShowCreateTierForm(prev => !prev)}
						className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#7cbc97] text-[#154c5b] hover:bg-[#e9f5e7] font-medium dark:border-[#6aab85] dark:hover:bg-gray-800'
					>
						<Plus className='w-4 h-4' />
						{t('createTier')}
						{showCreateTierForm ? (
							<ChevronUp className='w-4 h-4' />
						) : (
							<ChevronDown className='w-4 h-4' />
						)}
					</button>
				</div>
			</div>

			{/* Create Ticket Form */}
			{showCreateForm && (
				<div className='rounded-lg shadow-sm border border-slate-300/20 dark:border-dark-border/20 p-4 mb-6 dark:bg-dark-surface/30'>
					<h3 className='font-semibold text-[#154c5b] dark:text-dark-text mb-2'>
						{t('createTicketTitle')}
					</h3>
					<p className='text-sm text-[#48715b] dark:text-dark-text-secondary mb-4'>
						{t('createTicketDesc')}
					</p>
					<div className='flex flex-wrap gap-4 items-end'>
						<div className='flex-1 min-w-[200px]'>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								{t('user')} ID
							</label>
							<input
								type='text'
								value={createUserId}
								onChange={e => setCreateUserId(e.target.value)}
								placeholder={t('userIdPlaceholder')}
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							/>
						</div>
						<div className='min-w-[200px]'>
							<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
								{t('type')}
							</label>
							<select
								value={createTierId}
								onChange={e => setCreateTierId(e.target.value)}
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							>
								<option value=''>{t('selectTierPlaceholder')}</option>
								{(tiers as TicketTier[]).map((tier: TicketTier) => (
									<option key={tier.id} value={tier.id}>
										{tier.ticket_name} ({tier.tier_code})
									</option>
								))}
							</select>
						</div>
						<button
							type='button'
							onClick={handleCreateTicket}
							disabled={
								createTicketMutation.isPending ||
								!createUserId.trim() ||
								!createTierId
							}
							className='px-4 py-2 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85] font-medium disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{createTicketMutation.isPending
								? tCommon('processing')
								: t('createTicket')}
						</button>
					</div>
				</div>
			)}

			{/* Create Tier Form */}
			{showCreateTierForm && (
				<div className='rounded-lg shadow-sm border border-slate-300/20 dark:border-dark-border/20 p-4 mb-6 dark:bg-dark-surface/30'>
					<h3 className='font-semibold text-[#154c5b] dark:text-dark-text mb-2'>
						{t('createTierTitle')}
					</h3>
					<p className='text-sm text-[#48715b] dark:text-dark-text-secondary mb-4'>
						{t('createTierDesc')}
					</p>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
								{t('tierName')}
							</label>
							<input
								type='text'
								value={tierName}
								onChange={e => setTierName(e.target.value)}
								placeholder={t('tierNamePlaceholder')}
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
								{t('tierPrice')} (VND)
							</label>
							<input
								type='number'
								min={0}
								step={1}
								value={tierPrice}
								onChange={e => setTierPrice(e.target.value)}
								placeholder='0'
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
								{t('tierStock')}
							</label>
							<input
								type='number'
								min={0}
								value={tierStock}
								onChange={e => setTierStock(e.target.value)}
								placeholder='0'
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							/>
						</div>
						<div className='flex items-center gap-2'>
							<input
								type='checkbox'
								id='tier-is-active'
								checked={tierIsActive}
								onChange={e => setTierIsActive(e.target.checked)}
								className='rounded border-gray-300 text-[#7cbc97] focus:ring-[#7cbc97] dark:border-dark-border'
							/>
							<label
								htmlFor='tier-is-active'
								className='text-sm font-medium text-gray-700 dark:text-dark-text'
							>
								{t('tierIsActive')}
							</label>
						</div>
						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
								{t('description')}
							</label>
							<input
								type='text'
								value={tierDescription}
								onChange={e => setTierDescription(e.target.value)}
								placeholder={t('tierDescriptionPlaceholder')}
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							/>
						</div>
						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
								{t('tierBenefits')}
							</label>
							<textarea
								value={tierBenefitsText}
								onChange={e => setTierBenefitsText(e.target.value)}
								placeholder={t('tierBenefitsPlaceholder')}
								rows={3}
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text resize-none'
							/>
						</div>
						<div className='md:col-span-2'>
							<button
								type='button'
								onClick={handleCreateTier}
								disabled={
									createTierMutation.isPending ||
									!tierName.trim() ||
									tierPrice === '' ||
									tierStock === ''
								}
								className='px-4 py-2 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85] font-medium disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{createTierMutation.isPending
									? tCommon('processing')
									: t('createTier')}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Tier management table (with sold/remaining from stats) */}
			<div className='rounded-lg shadow-sm border border-slate-300/20 dark:border-dark-border/20 overflow-hidden mb-6'>
				<h3 className='font-semibold text-[#154c5b] dark:text-dark-text px-4 py-3 border-b border-slate-300/20 dark:border-dark-border/20'>
					{t('manageTiers')}
				</h3>
				{adminTiers.length === 0 ? (
					<div className='p-8 text-center text-gray-500 dark:text-dark-text-secondary'>
						{t('noTiers')}
					</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className=''>
								<tr>
									<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
										{t('tierName')}
									</th>
									<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
										{t('code')}
									</th>
									<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
										{t('tierPrice')}
									</th>
									<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
										{t('tierStock')}
									</th>
									<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
										{t('status')}
									</th>
									<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
										{t('tierIsActive')}
									</th>
									<th className='px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-dark-text'>
										{t('actions')}
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-slate-300/20 dark:divide-dark-border/20'>
								{adminTiers.map((tier: TicketTier) => {
									const tierStat = stats?.tier_stats?.find(
										(s: TierStatistics) => s.tier_id === tier.id
									)
									return (
										<tr
											key={tier.id}
											className='hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors'
										>
											<td className='px-4 py-3 font-medium text-[#154c5b] dark:text-dark-text'>
												{tier.ticket_name}
											</td>
											<td className='px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary'>
												{tier.tier_code}
											</td>
											<td className='px-4 py-3 text-sm'>
												{formatPrice(tier.price)} VND
											</td>
											<td className='px-4 py-3 text-sm'>{tier.stock}</td>
											<td className='px-4 py-3'>
												{tierStat ? (
													<div className='min-w-[120px]'>
														<div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-1.5'>
															<div
																className='bg-[#7cbc97] h-1.5 rounded-full transition-all'
																style={{
																	width: `${
																		tierStat.total_stock > 0
																			? (tierStat.sold / tierStat.total_stock) *
																				100
																			: 0
																	}%`,
																}}
															/>
														</div>
														<div className='flex justify-between text-xs text-gray-600 dark:text-dark-text-secondary'>
															<span>
																{t('sold')}: {tierStat.sold}
															</span>
															<span>
																{t('available')}: {tierStat.available}
															</span>
														</div>
													</div>
												) : (
													<span className='text-gray-400 dark:text-dark-text-secondary text-sm'>
														—
													</span>
												)}
											</td>
											<td className='px-4 py-3'>
												<span
													className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
														tier.is_active
															? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
															: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
													}`}
												>
													{tier.is_active ? t('active') : t('inactive')}
												</span>
											</td>
											<td className='px-4 py-3'>
												<div className='flex justify-end gap-1'>
													<button
														type='button'
														onClick={() => openEditTierModal(tier)}
														className='p-2 rounded-lg border border-slate-300/20 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors'
														title={t('editTier')}
													>
														<Pencil className='w-4 h-4 text-gray-600 dark:text-dark-text' />
													</button>
													{tier.is_active ? (
														<button
															type='button'
															onClick={() => handleDeactivateTier(tier)}
															disabled={deactivateTierMutation.isPending}
															className='p-2 rounded-lg border border-amber-300 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
															title={t('deactivate')}
														>
															<PowerOff className='w-4 h-4 text-amber-600 dark:text-amber-400' />
														</button>
													) : (
														<button
															type='button'
															onClick={() => handleActivateTier(tier)}
															disabled={activateTierMutation.isPending}
															className='p-2 rounded-lg border border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
															title={t('activate')}
														>
															<Power className='w-4 h-4 text-green-600 dark:text-green-400' />
														</button>
													)}
													<button
														type='button'
														onClick={() => handleDeleteTier(tier)}
														disabled={deleteTierMutation.isPending}
														className='p-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
														title={t('deleteTier')}
													>
														<Trash2 className='w-4 h-4 text-red-600 dark:text-red-400' />
													</button>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Summary statistics cards */}
			{!statsLoading && stats && (
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
					<div className='rounded-lg p-4 shadow-sm border border-slate-300/20 dark:border-dark-border/20 dark:bg-dark-surface/30'>
						<p className='text-sm text-gray-500 dark:text-dark-text-secondary'>
							{t('totalTickets')}
						</p>
						<p className='text-2xl font-bold text-[#154c5b] dark:text-dark-text'>
							{stats.total_tickets}
						</p>
					</div>
					<div className='rounded-lg p-4 shadow-sm border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20'>
						<p className='text-sm text-yellow-700 dark:text-yellow-400'>
							{t('pendingPayment')}
						</p>
						<p className='text-2xl font-bold text-yellow-700 dark:text-yellow-400'>
							{stats.pending_count}
						</p>
					</div>
					<div className='rounded-lg p-4 shadow-sm border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20'>
						<p className='text-sm text-blue-700 dark:text-blue-400'>
							{t('verifying')}
						</p>
						<p className='text-2xl font-bold text-blue-700 dark:text-blue-400'>
							{stats.self_confirmed_count}
						</p>
					</div>
					<div className='rounded-lg p-4 shadow-sm border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20'>
						<p className='text-sm text-green-700 dark:text-green-400'>
							{t('confirmed')}
						</p>
						<p className='text-2xl font-bold text-green-700 dark:text-green-400'>
							{stats.approved_count}
						</p>
					</div>
					<div className='rounded-lg p-4 shadow-sm border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20'>
						<p className='text-sm text-red-700 dark:text-red-400'>
							{t('denied')}
						</p>
						<p className='text-2xl font-bold text-red-700 dark:text-red-400'>
							{stats.denied_count}
						</p>
					</div>
					<div
						className={`rounded-lg p-4 shadow-sm border cursor-pointer transition-colors ${
							filter.pending_over_24
								? 'bg-orange-200 border-orange-400 dark:bg-orange-900/40 dark:border-orange-600'
								: 'bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800/50 dark:hover:bg-orange-900/30'
						}`}
						onClick={() => handleStatusFilter('pending_over_24')}
					>
						<p className='text-sm text-orange-700 dark:text-orange-400 flex items-center gap-1'>
							<AlertTriangle className='w-4 h-4' />
							{t('over24Hours')}
						</p>
						<p className='text-2xl font-bold text-orange-700 dark:text-orange-400'>
							{stats.pending_over_24_hours}
						</p>
					</div>
				</div>
			)}

			{/* Filters */}
			<div className='rounded-lg shadow-sm border border-slate-300/20 dark:border-dark-border/20 p-4 mb-6'>
				<div className='flex flex-wrap gap-4 items-center'>
					{/* Search */}
					<div className='flex-1 min-w-[200px] flex gap-2'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
							<input
								type='text'
								placeholder={t('searchPlaceholder')}
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && handleSearch()}
								className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
							/>
						</div>
						<button
							onClick={handleSearch}
							className='px-4 py-2 bg-[#7cbc97] text-white rounded-lg hover:bg-[#6aab85]'
						>
							{t('search')}
						</button>
					</div>

					{/* Status Filter */}
					<div className='flex items-center gap-2'>
						<Filter className='w-4 h-4 text-gray-400' />
						<select
							value={
								filter.pending_over_24
									? 'pending_over_24'
									: filter.status || 'all'
							}
							onChange={e =>
								handleStatusFilter(
									e.target.value as TicketStatus | 'all' | 'pending_over_24'
								)
							}
							className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
						>
							<option value='all'>{t('allStatus')}</option>
							<option value='pending'>{tTicket('status.pending')}</option>
							<option value='self_confirmed'>
								{tTicket('status.selfConfirmed')}
							</option>
							<option value='approved'>{tTicket('status.approved')}</option>
							<option value='denied'>{tTicket('status.denied')}</option>
							<option value='pending_over_24'>{t('over24Hours')}</option>
						</select>
					</div>

					{/* Tier Filter */}
					<select
						value={filter.tier_id || ''}
						onChange={e => handleTierFilter(e.target.value)}
						className='border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
					>
						<option value=''>{t('allTypes')}</option>
						{tiers.map((tier: TicketTier) => (
							<option key={tier.id} value={tier.id}>
								{tier.ticket_name}
							</option>
						))}
					</select>

					{/* Refresh Button */}
					<button
						onClick={() => refetchTickets()}
						className='p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors'
						title={t('refresh')}
					>
						<RefreshCw className='w-4 h-4 text-gray-600 dark:text-dark-text' />
					</button>
				</div>
			</div>

			{/* Tickets Table */}
			<div className='rounded-lg overflow-hidden'>
				{ticketsLoading ? (
					<div className='p-8 text-center text-gray-500 dark:text-dark-text-secondary'>
						{tCommon('loading')}
					</div>
				) : tickets.length === 0 ? (
					<div className='p-8 text-center text-gray-500 dark:text-dark-text-secondary'>
						{t('noTickets')}
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className=''>
									<tr>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('code')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('buyer')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('type')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('status')}
										</th>
										<th className='px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('createdAt')}
										</th>
										<th className='px-4 py-3 text-center text-sm font-semibold text-gray-600 dark:text-dark-text'>
											{t('actions')}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-300/20 dark:divide-dark-border/20'>
									{tickets.map((ticket: UserTicket) => {
										const statusConfig = STATUS_ICONS[ticket.status]
										const user = ticket.user
										return (
											<tr
												key={ticket.id}
												className='hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors'
											>
												<td className='px-4 py-3'>
													<span className='font-mono font-semibold text-[#154c5b] dark:text-dark-text'>
														{ticket.reference_code}
													</span>
												</td>
												<td className='px-4 py-3'>
													<div>
														<p className='font-medium text-gray-900 dark:text-dark-text'>
															{user?.first_name} {user?.last_name}
														</p>
														<p className='text-sm text-gray-500 dark:text-dark-text-secondary'>
															{user?.email}
														</p>
														{user?.fursona_name && (
															<p className='text-xs text-[#48715b] dark:text-dark-text-secondary'>
																({user.fursona_name})
															</p>
														)}
													</div>
												</td>
												<td className='px-4 py-3'>
													<div>
														<p className='font-medium text-gray-900 dark:text-dark-text'>
															{ticket.tier?.ticket_name}
														</p>
														<p className='text-sm text-gray-500 dark:text-dark-text-secondary'>
															{ticket.tier?.price
																? formatPrice(ticket.tier.price)
																: '–'}{' '}
															VND
														</p>
													</div>
												</td>
												<td className='px-4 py-3'>
													<span
														className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
													>
														{statusConfig.icon}
														{getStatusLabel(ticket.status)}
													</span>
													{ticket.denial_reason && (
														<p className='text-xs text-red-600 dark:text-red-400 mt-1'>
															{tTicket('denialReason')}: {ticket.denial_reason}
														</p>
													)}
												</td>
												<td className='px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary'>
													{new Date(ticket.created_at).toLocaleDateString(
														'vi-VN'
													)}
													<br />
													<span className='text-xs text-gray-400 dark:text-dark-text-secondary'>
														{new Date(ticket.created_at).toLocaleTimeString(
															'vi-VN'
														)}
													</span>
												</td>
												<td className='px-4 py-3'>
													<div className='flex justify-center gap-2'>
														<button
															onClick={() => handleApprove(ticket)}
															disabled={
																ticket.status !== 'self_confirmed' ||
																approveMutation.isPending
															}
															className='px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
														>
															{t('approve')}
														</button>
														<button
															onClick={() => handleDenyClick(ticket)}
															disabled={
																ticket.status !== 'self_confirmed' ||
																denyMutation.isPending
															}
															className='px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
														>
															{t('deny')}
														</button>
													</div>
													{ticket.status === 'approved' && (
														<div className='text-center mt-2'>
															<span className='text-xs text-green-600 dark:text-green-400'>
																{ticket.approved_at
																	? new Date(
																			ticket.approved_at
																		).toLocaleDateString('vi-VN')
																	: '–'}
															</span>
														</div>
													)}
													{ticket.status === 'denied' && (
														<div className='text-center mt-2'>
															<span className='text-xs text-red-600 dark:text-red-400'>
																{ticket.denied_at
																	? new Date(
																			ticket.denied_at
																		).toLocaleDateString('vi-VN')
																	: '–'}
															</span>
														</div>
													)}
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className='px-4 py-3 border-t border-slate-300/20 dark:border-dark-border/20 bg-gray-50 dark:bg-dark-surface/50'>
								<div className='flex items-center justify-between'>
									<div className='text-sm text-gray-600 dark:text-dark-text-secondary'>
										{tCommon('showing') || 'Showing'}{' '}
										{(pagination.currentPage - 1) *
											(pagination.pageSize || 20) +
											1}{' '}
										{tCommon('to') || 'to'}{' '}
										{Math.min(
											pagination.currentPage * (pagination.pageSize || 20),
											pagination.totalItems ?? 0
										)}{' '}
										{tCommon('of') || 'of'} {pagination.totalItems ?? 0}{' '}
										{tCommon('results') || 'results'}
									</div>
									<div className='flex items-center gap-2'>
										<button
											onClick={() =>
												handlePageChange(pagination.currentPage - 1)
											}
											disabled={pagination.currentPage <= 1}
											className='p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
										>
											<ChevronLeft className='w-4 h-4' />
										</button>
										<span className='text-sm text-gray-600 dark:text-dark-text-secondary px-2'>
											{tCommon('page') || 'Page'} {pagination.currentPage}{' '}
											{tCommon('of') || 'of'} {pagination.totalPages}
										</span>
										<button
											onClick={() =>
												handlePageChange(pagination.currentPage + 1)
											}
											disabled={pagination.currentPage >= pagination.totalPages}
											className='p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
										>
											<ChevronRight className='w-4 h-4' />
										</button>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Deny Dialog */}
			{showDenyDialog && selectedTicket && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
					<div className='rounded-xl p-6 max-w-md mx-4 shadow-2xl border border-slate-300/20 dark:border-dark-border/20 bg-white dark:bg-dark-surface'>
						<h3 className='text-xl font-semibold text-[#154c5b] dark:text-dark-text mb-4'>
							{t('denyTicketTitle')}
						</h3>
						<p className='text-[#48715b] dark:text-dark-text-secondary mb-2'>
							{t('denyingTicket', { code: selectedTicket.reference_code })}
						</p>
						<p className='text-sm text-gray-500 dark:text-dark-text-secondary mb-4'>
							{t('user')}: {selectedTicket.user?.first_name}{' '}
							{selectedTicket.user?.last_name} ({selectedTicket.user?.email})
						</p>

						{selectedTicket.user && selectedTicket.user.denial_count >= 2 && (
							<div className='bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4'>
								<p className='text-orange-800 text-sm flex items-center gap-2'>
									<AlertTriangle className='w-4 h-4' />
									{t('blacklistWarning', {
										count: selectedTicket.user.denial_count,
									})}
								</p>
							</div>
						)}

						<div className='mb-4'>
							<label className='block text-sm text-[#48715b] dark:text-dark-text-secondary mb-1'>
								{t('denyReason')}
							</label>
							<textarea
								value={denyReason}
								onChange={e => setDenyReason(e.target.value)}
								placeholder={t('denyReasonPlaceholder')}
								className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text resize-none'
								rows={3}
							/>
						</div>

						{denyMutation.isError && (
							<div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
								<p className='text-red-800 text-sm'>
									{tTicket('errorOccurred')}
								</p>
							</div>
						)}

						<div className='flex gap-3'>
							<button
								onClick={() => {
									setShowDenyDialog(false)
									setSelectedTicket(null)
								}}
								className='flex-1 py-2 px-4 rounded-lg border border-slate-300 dark:border-dark-border text-[#48715b] dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface/50'
							>
								{tCommon('cancel')}
							</button>
							<button
								onClick={handleDenyConfirm}
								disabled={denyMutation.isPending}
								className='flex-1 py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
							>
								{denyMutation.isPending
									? tCommon('processing')
									: t('confirmDeny')}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Tier Modal */}
			{editTierModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
					<div className='rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-300/20 dark:border-dark-border/20 bg-white dark:bg-dark-surface'>
						<h3 className='text-xl font-semibold text-[#154c5b] dark:text-dark-text mb-4'>
							{t('editTier')} – {editTierModal.tier_code}
						</h3>
						<div className='grid grid-cols-1 gap-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
									{t('tierName')}
								</label>
								<input
									type='text'
									value={editTierName}
									onChange={e => setEditTierName(e.target.value)}
									className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
								/>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
										{t('tierPrice')} (VND)
									</label>
									<input
										type='number'
										min={0}
										value={editTierPrice}
										onChange={e => setEditTierPrice(e.target.value)}
										className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
										{t('tierStock')}
									</label>
									<input
										type='number'
										min={0}
										value={editTierStock}
										onChange={e => setEditTierStock(e.target.value)}
										className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
									/>
								</div>
							</div>
							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									id='edit-tier-active'
									checked={editTierIsActive}
									onChange={e => setEditTierIsActive(e.target.checked)}
									className='rounded border-gray-300 text-[#7cbc97] focus:ring-[#7cbc97] dark:border-dark-border'
								/>
								<label
									htmlFor='edit-tier-active'
									className='text-sm font-medium text-gray-700 dark:text-dark-text'
								>
									{t('tierIsActive')}
								</label>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
									{t('description')}
								</label>
								<input
									type='text'
									value={editTierDescription}
									onChange={e => setEditTierDescription(e.target.value)}
									className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1'>
									{t('tierBenefits')}
								</label>
								<textarea
									value={editTierBenefitsText}
									onChange={e => setEditTierBenefitsText(e.target.value)}
									rows={3}
									className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7cbc97] dark:bg-dark-surface dark:border-dark-border dark:text-dark-text resize-none'
								/>
							</div>
						</div>
						<div className='flex gap-3 mt-6'>
							<button
								type='button'
								onClick={() => setEditTierModal(null)}
								className='flex-1 py-2 px-4 rounded-lg border border-slate-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50'
							>
								{tCommon('cancel')}
							</button>
							<button
								type='button'
								onClick={handleUpdateTier}
								disabled={updateTierMutation.isPending}
								className='flex-1 py-2 px-4 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85] disabled:opacity-50'
							>
								{updateTierMutation.isPending
									? tCommon('processing')
									: tCommon('save')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default TicketManagementPage
