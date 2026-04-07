'use client'

import React, { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
	UserCircle,
	ArrowLeft,
	CheckCircle,
	XCircle,
	Shield,
	Mail,
	MapPin,
	Calendar,
	Pencil,
	Save,
	X,
	Ban,
	CircleCheck,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	useAdminGetUserById,
	useAdminUpdateUser,
} from '@/hooks/services/user/useAdminUser'
import {
	useBlacklistUser,
	useUnblacklistUser,
} from '@/hooks/services/ticket/useAdminTicket'
import type { AdminUpdateUserRequest } from '@/types/api/user/user'
import type { Account } from '@/types/models/auth/account'
import Loading from '@/components/common/Loading'
import UserAvatar from '@/components/common/UserAvatar'
import BanUserModal from '@/components/admin/BanUserModal'

interface AdminUserDetailPageProps {
	params: Promise<{ id: string }>
}

const formatDateTime = (dateString?: string): string => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	return (
		date.toLocaleDateString('vi-VN') +
		' ' +
		date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
	)
}

const formatDateOnly = (dateString?: string): string => {
	if (!dateString) return '–'
	const date = new Date(dateString)
	if (Number.isNaN(date.getTime())) return dateString
	return date.toLocaleDateString('vi-VN')
}

const ROLES = [
	{ value: 'user', label: 'User' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'staff', label: 'Staff' },
	{ value: 'dealer', label: 'Dealer' },
] as const

const getRoleDisplay = (
	role?: string
): { label: string; color: string; bgColor: string } => {
	const roleMap: Record<
		string,
		{ label: string; color: string; bgColor: string }
	> = {
		admin: {
			label: 'Admin',
			color: 'text-purple-700',
			bgColor: 'bg-purple-100',
		},
		staff: { label: 'Staff', color: 'text-blue-700', bgColor: 'bg-blue-100' },
		dealer: {
			label: 'Dealer',
			color: 'text-amber-700',
			bgColor: 'bg-amber-100',
		},
		user: { label: 'User', color: 'text-gray-700', bgColor: 'bg-gray-100' },
	}
	return roleMap[role?.toLowerCase() || 'user'] || roleMap.user
}

// Reusable info field matching the design language
const InfoField = ({
	label,
	value,
	icon: Icon,
}: {
	label: string
	value: string
	icon?: React.ElementType
}) => (
	<div className='space-y-0.5 px-3 py-2.5 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
		<div className='flex items-center gap-2'>
			{Icon && <Icon className='w-4 h-4 text-[#48715B]' />}
			<p className='text-sm font-medium text-[#48715B]'>{label}</p>
		</div>
		<p className='text-lg text-text-secondary'>{value}</p>
	</div>
)

const AdminUserDetailPage = ({
	params,
}: AdminUserDetailPageProps): React.ReactElement => {
	const { id } = use(params)
	const router = useRouter()
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')

	const { data, isLoading, isError } = useAdminGetUserById(id)
	const updateUser = useAdminUpdateUser(id)
	const blacklistMutation = useBlacklistUser()
	const unblacklistMutation = useUnblacklistUser()
	const user = data?.data

	const [isEditing, setIsEditing] = useState(false)
	const [banTargetUser, setBanTargetUser] = useState<Account | null>(null)
	const [form, setForm] = useState({
		first_name: '',
		last_name: '',
		fursona_name: '',
		country: '',
		role: 'user' as AdminUpdateUserRequest['role'],
		is_verified: false,
	})

	useEffect(() => {
		if (!user) return
		setForm({
			first_name: user.first_name ?? '',
			last_name: user.last_name ?? '',
			fursona_name: user.fursona_name ?? '',
			country: user.country ?? '',
			role:
				(user.role?.toLowerCase() as AdminUpdateUserRequest['role']) || 'user',
			is_verified: user.is_verified ?? false,
		})
	}, [user])

	const handleSave = async () => {
		try {
			const payload: AdminUpdateUserRequest = {
				first_name: form.first_name || undefined,
				last_name: form.last_name || undefined,
				fursona_name: form.fursona_name || undefined,
				country: form.country || undefined,
				role: form.role,
				is_verified: form.is_verified,
			}
			await updateUser.mutateAsync(payload)
			toast.success(t('userUpdated') || 'User updated successfully')
			setIsEditing(false)
		} catch {
			toast.error(t('userUpdateFailed') || 'Failed to update user')
		}
	}

	const handleBanClick = (e: React.MouseEvent) => {
		e.preventDefault()
		const role = user?.role?.toLowerCase()
		if (role === 'admin' || role === 'staff') {
			toast.error(t('cannotBanStaffOrAdmin') || 'Cannot ban admin or staff.')
			return
		}
		setBanTargetUser(user ?? null)
	}

	const handleBanConfirm = async (reason: string) => {
		if (!user) return
		try {
			await blacklistMutation.mutateAsync({
				userId: user.id,
				reason: reason.trim(),
			})
			toast.success(t('userBanned') || 'User banned.')
			setBanTargetUser(null)
		} catch {
			toast.error(t('banFailed') || 'Failed to ban user.')
		}
	}

	const handleUnban = async (e: React.MouseEvent) => {
		e.preventDefault()
		if (!user) return
		if (!window.confirm(t('unbanConfirm') || `Unban ${user.email || user.id}?`))
			return
		try {
			await unblacklistMutation.mutateAsync(user.id)
			toast.success(t('userUnbanned') || 'User unbanned.')
		} catch {
			toast.error(t('unbanFailed') || 'Failed to unban user.')
		}
	}

	if (isLoading) {
		return <Loading />
	}

	if (isError || !user) {
		return (
			<div className='py-8'>
				<button
					onClick={() => router.push('/admin')}
					className='flex items-center gap-2 text-[#48715B] hover:underline mb-4'
				>
					<ArrowLeft className='w-4 h-4' />
					{tCommon('back') || 'Back'}
				</button>
				<div className='p-8 text-center text-text-secondary rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15'>
					{t('userNotFound') || 'User not found'}
				</div>
			</div>
		)
	}

	const isBanned = user.is_banned ?? user.is_blacklisted ?? false
	const roleDisplay = getRoleDisplay(user.role)
	const displayName =
		user.first_name || user.last_name
			? `${user.first_name || ''} ${user.last_name || ''}`.trim()
			: user.fursona_name || user.email

	return (
		<div className='w-full'>
			<button
				onClick={() => router.back()}
				className='flex items-center gap-2 text-[#48715B] hover:underline mb-6'
			>
				<ArrowLeft className='w-4 h-4' />
				{tCommon('back') || 'Back'}{' '}
				{t('userManagement') || 'to User Management'}
			</button>

			<div className='rounded-xl border border-[#8C8C8C]/15 overflow-hidden'>
				{/* Header */}
				<div className='flex flex-col gap-4 border-b border-[#48715B]/15 bg-[#E2EEE2]/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
					<h1 className='josefin flex items-center gap-2 text-lg font-bold text-text-primary sm:text-xl'>
						<UserCircle className='h-6 w-6 shrink-0' />
						{t('userDetail') || 'User Detail'}
					</h1>
					{!isEditing ? (
						<div className='flex flex-wrap items-center gap-2 sm:justify-end'>
							{isBanned ? (
								<button
									type='button'
									onClick={handleUnban}
									disabled={unblacklistMutation.isPending}
									className='inline-flex items-center gap-1.5 rounded-xl border border-emerald-400 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50'
									title={t('unban') || 'Unban'}
								>
									<CircleCheck className='h-4 w-4' />
									{t('unban') || 'Unban'}
								</button>
							) : (
								<button
									type='button'
									onClick={handleBanClick}
									disabled={
										user.role?.toLowerCase() === 'admin' ||
										user.role?.toLowerCase() === 'staff'
									}
									className='inline-flex items-center gap-1.5 rounded-xl border border-red-400 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed'
									title={
										user.role?.toLowerCase() === 'admin' ||
										user.role?.toLowerCase() === 'staff'
											? t('cannotBanStaffOrAdmin') ||
												'Cannot ban admin or staff'
											: t('ban') || 'Ban'
									}
								>
									<Ban className='h-4 w-4' />
									{t('ban') || 'Ban'}
								</button>
							)}
							<button
								type='button'
								onClick={() => setIsEditing(true)}
								className='flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#48715B] text-[#48715B] hover:bg-[#E2EEE2] transition-colors'
							>
								<Pencil className='w-4 h-4' />
								{t('editUser') || 'Edit user'}
							</button>
						</div>
					) : (
						<div className='flex flex-wrap items-center gap-2 sm:justify-end'>
							<button
								type='button'
								onClick={() => setIsEditing(false)}
								disabled={updateUser.isPending}
								className='flex items-center gap-2 rounded-xl border border-[#8C8C8C]/40 px-4 py-2.5 text-text-secondary transition-colors hover:bg-[#E2EEE2] disabled:opacity-50'
							>
								<X className='w-4 h-4' />
								{tCommon('cancel') || 'Cancel'}
							</button>
							<button
								type='button'
								onClick={handleSave}
								disabled={updateUser.isPending}
								className='flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary font-medium disabled:opacity-50'
							>
								<Save className='w-4 h-4' />
								{updateUser.isPending
									? tCommon('saving') || 'Saving...'
									: tCommon('save') || 'Save'}
							</button>
						</div>
					)}
				</div>

				<div className='space-y-6 p-4 sm:p-6'>
					{isEditing ? (
						/* Edit form */
						<div className='space-y-4 max-w-xl'>
							<div className='space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 focus-within:border-[#48715B] transition-colors'>
								<label className='text-sm font-medium text-[#48715B]'>
									{t('firstName') || 'First name'}
								</label>
								<input
									type='text'
									value={form.first_name}
									onChange={e =>
										setForm(f => ({ ...f, first_name: e.target.value }))
									}
									className='block w-full bg-transparent text-lg text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none'
								/>
							</div>
							<div className='space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 focus-within:border-[#48715B] transition-colors'>
								<label className='text-sm font-medium text-[#48715B]'>
									{t('lastName') || 'Last name'}
								</label>
								<input
									type='text'
									value={form.last_name}
									onChange={e =>
										setForm(f => ({ ...f, last_name: e.target.value }))
									}
									className='block w-full bg-transparent text-lg text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none'
								/>
							</div>
							<div className='space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 focus-within:border-[#48715B] transition-colors'>
								<label className='text-sm font-medium text-[#48715B]'>
									{t('nickname') || 'Nickname'}
								</label>
								<input
									type='text'
									value={form.fursona_name}
									onChange={e =>
										setForm(f => ({ ...f, fursona_name: e.target.value }))
									}
									className='block w-full bg-transparent text-lg text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none'
								/>
							</div>
							<div className='space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 focus-within:border-[#48715B] transition-colors'>
								<label className='text-sm font-medium text-[#48715B]'>
									{tCommon('country') || 'Country'}
								</label>
								<input
									type='text'
									value={form.country}
									onChange={e =>
										setForm(f => ({ ...f, country: e.target.value }))
									}
									className='block w-full bg-transparent text-lg text-text-secondary placeholder-[#8C8C8C]/40 focus:outline-none'
								/>
							</div>
							<div className='space-y-0.5 px-3 py-2 rounded-xl bg-[#E2EEE2]/60 border border-[#8C8C8C]/15 focus-within:border-[#48715B] transition-colors'>
								<label className='text-sm font-medium text-[#48715B]'>
									{t('role') || 'Role'}
								</label>
								<select
									value={form.role ?? 'user'}
									onChange={e =>
										setForm(f => ({
											...f,
											role: e.target.value as AdminUpdateUserRequest['role'],
										}))
									}
									className='block w-full bg-transparent text-lg text-text-secondary focus:outline-none'
								>
									{ROLES.map(r => (
										<option key={r.value} value={r.value}>
											{r.label}
										</option>
									))}
								</select>
							</div>
							<div className='flex items-center gap-2 px-3 py-2.5'>
								<input
									type='checkbox'
									id='is_verified'
									checked={form.is_verified}
									onChange={e =>
										setForm(f => ({ ...f, is_verified: e.target.checked }))
									}
									className='w-4 h-4 accent-[#48715B]'
								/>
								<label
									htmlFor='is_verified'
									className='text-sm font-medium text-text-secondary'
								>
									{t('verified') || 'Verified'}
								</label>
							</div>
						</div>
					) : (
						/* View mode */
						<>
							{/* Identity + Avatar */}
							<div className='pb-6 border-b border-[#48715B]/15'>
								<div className='flex items-start gap-4'>
									<UserAvatar account={user} size={96} />
									<div className='min-w-0 flex-1'>
										<p className='font-medium text-text-primary text-xl truncate'>
											{displayName}
										</p>
										{user.fursona_name && (
											<p className='text-sm text-[#48715B] mt-1 truncate'>
												{t('nickname') || 'Nickname'}: {user.fursona_name}
											</p>
										)}
										<p className='text-sm text-text-secondary mt-1 truncate'>
											ID: {user.id}
										</p>
									</div>
								</div>
							</div>

							{/* Info grid */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<InfoField
									label={t('email') || 'Email'}
									value={user.email}
									icon={Mail}
								/>
								<InfoField
									label={tCommon('country') || 'Country'}
									value={user.country || '–'}
									icon={MapPin}
								/>
								<InfoField
									label={t('dateOfBirth') || 'Date of birth'}
									value={formatDateOnly(user.date_of_birth)}
									icon={Calendar}
								/>
								<InfoField
									label={t('idCard') || 'ID card'}
									value={user.id_card ? user.id_card : '–'}
								/>
							</div>

							{/* Role */}
							<div className='pt-4 border-t border-[#48715B]/15'>
								<div className='flex items-center gap-3'>
									<Shield className='w-5 h-5 text-[#48715B]' />
									<div>
										<p className='text-sm font-medium text-[#48715B] mb-1'>
											{t('role') || 'Role'}
										</p>
										<span
											className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleDisplay.bgColor} ${roleDisplay.color}`}
										>
											{roleDisplay.label}
										</span>
									</div>
								</div>
							</div>

							{/* Status */}
							<div className='pt-4 border-t border-[#48715B]/15'>
								<p className='text-sm font-medium text-[#48715B] mb-2'>
									{t('status') || 'Status'}
								</p>
								<div className='flex flex-wrap gap-2'>
									{user.is_verified !== undefined && (
										<span
											className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
												user.is_verified
													? 'bg-green-100 text-green-700'
													: 'bg-yellow-100 text-yellow-700'
											}`}
										>
											{user.is_verified ? (
												<CheckCircle className='w-3 h-3' />
											) : (
												<XCircle className='w-3 h-3' />
											)}
											{user.is_verified
												? t('verified') || 'Verified'
												: t('unverified') || 'Unverified'}
										</span>
									)}
									{isBanned && (
										<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'>
											<XCircle className='w-3 h-3' />
											{t('blacklisted') || 'Blacklisted'}
										</span>
									)}
									{user.denial_count !== undefined && user.denial_count > 0 && (
										<span className='text-xs text-orange-600'>
											{t('denials') || 'Denials'}: {user.denial_count}
										</span>
									)}
									{user.is_dealer !== undefined && (
										<span
											className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
												user.is_dealer
													? 'bg-amber-100 text-amber-800'
													: 'bg-gray-100 text-gray-700'
											}`}
										>
											{t('dealer') || 'Dealer'}:{' '}
											{user.is_dealer
												? tCommon('yes') || 'Yes'
												: tCommon('no') || 'No'}
										</span>
									)}
									{user.is_has_ticket !== undefined && (
										<span
											className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
												user.is_has_ticket
													? 'bg-emerald-100 text-emerald-800'
													: 'bg-gray-100 text-gray-700'
											}`}
										>
											{t('hasTicket') || 'Has ticket'}:{' '}
											{user.is_has_ticket
												? tCommon('yes') || 'Yes'
												: tCommon('no') || 'No'}
										</span>
									)}
									{user.is_deleted && (
										<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700'>
											{tCommon('deleted') || 'Deleted'}
										</span>
									)}
								</div>
							</div>

							{/* Dates */}
							<div className='pt-4 border-t border-[#48715B]/15'>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<InfoField
										label={t('createdAt') || 'Created At'}
										value={formatDateTime(user.created_at)}
										icon={Calendar}
									/>
									{user.modified_at && (
										<InfoField
											label={tCommon('modified') || 'Modified'}
											value={formatDateTime(user.modified_at)}
											icon={Calendar}
										/>
									)}
									{user.deleted_at && (
										<InfoField
											label={tCommon('deleted') || 'Deleted'}
											value={formatDateTime(user.deleted_at ?? undefined)}
											icon={Calendar}
										/>
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			<BanUserModal
				user={banTargetUser ?? null}
				onClose={() => setBanTargetUser(null)}
				onConfirm={handleBanConfirm}
				isPending={blacklistMutation.isPending}
			/>
		</div>
	)
}

export default AdminUserDetailPage
