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
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
	useAdminGetUserById,
	useAdminUpdateUser,
} from '@/hooks/services/user/useAdminUser'
import type { AdminUpdateUserRequest } from '@/types/api/user/user'
import Loading from '@/components/common/Loading'

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

const AdminUserDetailPage = ({
	params,
}: AdminUserDetailPageProps): React.ReactElement => {
	const { id } = use(params)
	const router = useRouter()
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')

	const { data, isLoading, isError } = useAdminGetUserById(id)
	const updateUser = useAdminUpdateUser(id)
	const user = data?.data

	const [isEditing, setIsEditing] = useState(false)
	const [form, setForm] = useState({
		first_name: '',
		last_name: '',
		fursona_name: '',
		country: '',
		role: 'user' as AdminUpdateUserRequest['role'],
		is_verified: false,
	})

	// Sync form from user when user loads or when entering edit mode
	useEffect(() => {
		if (!user) return
		setForm({
			first_name: user.first_name ?? '',
			last_name: user.last_name ?? '',
			fursona_name: user.fursona_name ?? '',
			country: user.country ?? '',
			role: (user.role?.toLowerCase() as AdminUpdateUserRequest['role']) || 'user',
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

	if (isLoading) {
		return <Loading />
	}

	if (isError || !user) {
		return (
			<div className='py-8'>
				<button
					onClick={() => router.push('/admin')}
					className='flex items-center gap-2 text-[#48715b] dark:text-dark-text-secondary hover:underline mb-4'
				>
					<ArrowLeft className='w-4 h-4' />
					{tCommon('back') || 'Back'}
				</button>
				<div className='p-8 text-center text-gray-500 dark:text-dark-text-secondary rounded-lg border border-slate-300/20 dark:border-dark-border/20'>
					{t('userNotFound') || 'User not found'}
				</div>
			</div>
		)
	}

	const roleDisplay = getRoleDisplay(user.role)
	const displayName =
		user.first_name || user.last_name
			? `${user.first_name || ''} ${user.last_name || ''}`.trim()
			: user.fursona_name || user.email

	return (
		<div id='admin-user-detail-page' className='w-full'>
			<button
				onClick={() => router.push('/admin')}
				className='flex items-center gap-2 text-[#48715b] dark:text-dark-text-secondary hover:underline mb-6'
			>
				<ArrowLeft className='w-4 h-4' />
				{tCommon('back') || 'Back'} {t('userManagement') || 'to User Management'}
			</button>

			<div className='rounded-lg border border-slate-300/20 dark:border-dark-border/20 overflow-hidden'>
				{/* Header */}
				<div className='bg-gray-50 dark:bg-dark-surface/50 px-6 py-4 border-b border-slate-300/20 dark:border-dark-border/20 flex items-center justify-between'>
					<h1 className='text-xl font-bold text-[#154c5b] dark:text-dark-text flex items-center gap-2'>
						<UserCircle className='w-6 h-6' />
						{t('userDetail') || 'User Detail'}
					</h1>
					{!isEditing ? (
						<button
							type='button'
							onClick={() => setIsEditing(true)}
							className='flex items-center gap-2 px-4 py-2 rounded-lg border border-[#7cbc97] text-[#154c5b] dark:border-dark-border dark:text-dark-text hover:bg-[#7cbc97]/10 dark:hover:bg-dark-surface transition-colors'
						>
							<Pencil className='w-4 h-4' />
							{t('editUser') || 'Edit user'}
						</button>
					) : (
						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={() => setIsEditing(false)}
								disabled={updateUser.isPending}
								className='flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors disabled:opacity-50'
							>
								<X className='w-4 h-4' />
								{tCommon('cancel') || 'Cancel'}
							</button>
							<button
								type='button'
								onClick={handleSave}
								disabled={updateUser.isPending}
								className='flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7cbc97] text-white hover:bg-[#6aab85] transition-colors disabled:opacity-50'
							>
								<Save className='w-4 h-4' />
								{updateUser.isPending ? tCommon('saving') || 'Saving...' : tCommon('save') || 'Save'}
							</button>
						</div>
					)}
				</div>

				<div className='p-6 space-y-6'>
					{isEditing ? (
						/* Edit form */
						<div className='space-y-4 max-w-xl'>
							<div>
								<label className='block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1'>
									{t('firstName') || 'First name'}
								</label>
								<input
									type='text'
									value={form.first_name}
									onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
									className='w-full px-4 py-2 border rounded-lg dark:bg-dark-surface dark:border-dark-border dark:text-dark-text focus:ring-2 focus:ring-[#7cbc97] focus:border-transparent'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1'>
									{t('lastName') || 'Last name'}
								</label>
								<input
									type='text'
									value={form.last_name}
									onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
									className='w-full px-4 py-2 border rounded-lg dark:bg-dark-surface dark:border-dark-border dark:text-dark-text focus:ring-2 focus:ring-[#7cbc97] focus:border-transparent'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1'>
									{t('fursonaName') || 'Fursona name'}
								</label>
								<input
									type='text'
									value={form.fursona_name}
									onChange={e => setForm(f => ({ ...f, fursona_name: e.target.value }))}
									className='w-full px-4 py-2 border rounded-lg dark:bg-dark-surface dark:border-dark-border dark:text-dark-text focus:ring-2 focus:ring-[#7cbc97] focus:border-transparent'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1'>
									{tCommon('country') || 'Country'}
								</label>
								<input
									type='text'
									value={form.country}
									onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
									className='w-full px-4 py-2 border rounded-lg dark:bg-dark-surface dark:border-dark-border dark:text-dark-text focus:ring-2 focus:ring-[#7cbc97] focus:border-transparent'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1'>
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
									className='w-full px-4 py-2 border rounded-lg dark:bg-dark-surface dark:border-dark-border dark:text-dark-text focus:ring-2 focus:ring-[#7cbc97] focus:border-transparent'
								>
									{ROLES.map(r => (
										<option key={r.value} value={r.value}>
											{r.label}
										</option>
									))}
								</select>
							</div>
							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									id='is_verified'
									checked={form.is_verified}
									onChange={e => setForm(f => ({ ...f, is_verified: e.target.checked }))}
									className='w-4 h-4 rounded border-gray-300 text-[#7cbc97] focus:ring-[#7cbc97]'
								/>
								<label htmlFor='is_verified' className='text-sm font-medium text-gray-700 dark:text-dark-text'>
									{t('verified') || 'Verified'}
								</label>
							</div>
						</div>
					) : (
						/* View mode */
						<>
							{/* Identity */}
							<div>
								<h2 className='text-sm font-semibold text-gray-600 dark:text-dark-text-secondary mb-2'>
									{t('user') || 'User'}
								</h2>
								<p className='font-medium text-gray-900 dark:text-dark-text text-lg'>
									{displayName}
								</p>
								{user.fursona_name && (
									<p className='text-sm text-[#48715b] dark:text-dark-text-secondary'>
										Fursona: {user.fursona_name}
									</p>
								)}
							</div>

							{/* Email (read-only) */}
							<div className='flex items-center gap-3'>
								<Mail className='w-5 h-5 text-gray-500 dark:text-dark-text-secondary' />
								<div>
									<p className='text-sm text-gray-600 dark:text-dark-text-secondary'>
										{t('email') || 'Email'}
									</p>
									<p className='text-gray-900 dark:text-dark-text'>{user.email}</p>
								</div>
							</div>

							{/* Country */}
							<div className='flex items-center gap-3'>
								<MapPin className='w-5 h-5 text-gray-500 dark:text-dark-text-secondary' />
								<div>
									<p className='text-sm text-gray-600 dark:text-dark-text-secondary'>
										{tCommon('country') || 'Country'}
									</p>
									<p className='text-gray-900 dark:text-dark-text'>
										{user.country || '–'}
									</p>
								</div>
							</div>

							{/* Role */}
							<div className='flex items-center gap-3'>
								<Shield className='w-5 h-5 text-gray-500 dark:text-dark-text-secondary' />
								<div>
									<p className='text-sm text-gray-600 dark:text-dark-text-secondary mb-1'>
										{t('role') || 'Role'}
									</p>
									<span
										className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleDisplay.bgColor} ${roleDisplay.color}`}
									>
										{roleDisplay.label}
									</span>
								</div>
							</div>

							{/* Status */}
							<div>
								<p className='text-sm text-gray-600 dark:text-dark-text-secondary mb-2'>
									{t('status') || 'Status'}
								</p>
								<div className='flex flex-wrap gap-2'>
									{user.is_verified !== undefined && (
										<span
											className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
												user.is_verified
													? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
													: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
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
									{user.is_blacklisted && (
										<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'>
											<XCircle className='w-3 h-3' />
											{t('blacklisted') || 'Blacklisted'}
										</span>
									)}
									{user.denial_count !== undefined && user.denial_count > 0 && (
										<span className='text-xs text-orange-600 dark:text-orange-400'>
											{t('denials') || 'Denials'}: {user.denial_count}
										</span>
									)}
								</div>
							</div>

							{/* Dates */}
							<div className='flex items-center gap-3'>
								<Calendar className='w-5 h-5 text-gray-500 dark:text-dark-text-secondary' />
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-gray-600 dark:text-dark-text-secondary'>
											{t('createdAt') || 'Created At'}
										</p>
										<p className='text-gray-900 dark:text-dark-text text-sm'>
											{formatDateTime(user.created_at)}
										</p>
									</div>
									{user.modified_at && (
										<div>
											<p className='text-sm text-gray-600 dark:text-dark-text-secondary'>
												{tCommon('modified') || 'Modified'}
											</p>
											<p className='text-gray-900 dark:text-dark-text text-sm'>
												{formatDateTime(user.modified_at)}
											</p>
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default AdminUserDetailPage
