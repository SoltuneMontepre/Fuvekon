'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateMe } from '@/hooks/services/auth/useAccount'

const InfoField = ({
	label,
	value,
	name,
	editable = false,
	onChange,
}: {
	label: string
	value: string | undefined
	name?: string
	editable?: boolean
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
	<div className='space-y-2'>
		<label className='text-sm font-medium text-white dark:text-dark-text-secondary'>
			{label}
		</label>
		{editable && name ? (
			<input
				type='text'
				name={name}
				value={value || ''}
				onChange={onChange}
				className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				placeholder={`Nhập ${label.toLowerCase()}`}
			/>
		) : (
			<div className='text-base text-white dark:text-dark-text'>
				{value || 'N/A'}
			</div>
		)}
	</div>
)

const AccountInfo = () => {
	const account = useAuthStore(state => state.account)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		fursona_name: '',
		country: '',
	})
	const updateMeMutation = useUpdateMe()

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target
			setFormData(prev => ({
				...prev,
				[name]: value,
			}))
		},
		[]
	)

	// Initialize form data when account loads (only when not editing)
	useEffect(() => {
		if (account && !isEditing) {
			setFormData({
				first_name: account.first_name || '',
				last_name: account.last_name || '',
				fursona_name: account.fursona_name || '',
				country: account.country || '',
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account?.id]) // Only sync when account ID changes (new account loaded), not on every account update

	if (!account) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-lg text-gray-500 dark:text-dark-text-secondary'>
					No account information available
				</div>
			</div>
		)
	}

	// Combine first and last name for full name
	const fullName =
		[account.first_name, account.last_name].filter(Boolean).join(' ') ||
		undefined

	const handleCancel = () => {
		setFormData({
			first_name: account.first_name || '',
			last_name: account.last_name || '',
			fursona_name: account.fursona_name || '',
			country: account.country || '',
		})
		setIsEditing(false)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		updateMeMutation.mutate(
			{
				first_name: formData.first_name || undefined,
				last_name: formData.last_name || undefined,
				fursona_name: formData.fursona_name || undefined,
				country: formData.country || undefined,
			},
			{
				onSuccess: data => {
					if (data.isSuccess) {
						setIsEditing(false)
					}
				},
			}
		)
	}

	return (
		<div className='rounded-[30px] border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-8 shadow-sm'>
			<h1 className='text-3xl font-bold text-gray-900 dark:text-dark-text mb-8 text-center'>
				TÀI KHOẢN
			</h1>
			<form onSubmit={handleSubmit}>
				<div className='space-y-6'>
					{isEditing ? (
						<>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<InfoField
									label='Họ'
									value={formData.first_name}
									name='first_name'
									editable={isEditing}
									onChange={handleInputChange}
								/>
								<InfoField
									label='Tên'
									value={formData.last_name}
									name='last_name'
									editable={isEditing}
									onChange={handleInputChange}
								/>
							</div>
							<InfoField
								label='Tên fursona'
								value={formData.fursona_name}
								name='fursona_name'
								editable={isEditing}
								onChange={handleInputChange}
							/>
							<InfoField label='Gmail' value={account.email} />
							<InfoField label='Số điện thoại' value={undefined} />
							<InfoField
								label='Quốc gia'
								value={formData.country}
								name='country'
								editable={isEditing}
								onChange={handleInputChange}
							/>
						</>
					) : (
						<>
							<InfoField label='Họ và Tên' value={fullName} />
							<InfoField label='Tên fursona' value={account.fursona_name} />
							<InfoField label='Gmail' value={account.email} />
							<InfoField label='Số điện thoại' value={undefined} />
							<InfoField label='Quốc gia' value={account.country} />
						</>
					)}
				</div>

				{/* Edit Information Section */}
				<div className='mt-8 pt-8'>
					{!isEditing ? (
						<button
							type='button'
							onClick={() => {
								// Initialize form data with current account values when entering edit mode
								setFormData({
									first_name: account.first_name || '',
									last_name: account.last_name || '',
									fursona_name: account.fursona_name || '',
									country: account.country || '',
								})
								setIsEditing(true)
							}}
							className='w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface'
						>
							Chỉnh sửa thông tin
						</button>
					) : (
						<div className='space-y-4'>
							{updateMeMutation.isError && (
								<div className='p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm'>
									Cập nhật thất bại. Vui lòng thử lại.
								</div>
							)}
							<div className='flex gap-4'>
								<button
									type='submit'
									disabled={updateMeMutation.isPending}
									className='flex-1 py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{updateMeMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
								</button>
								<button
									type='button'
									onClick={handleCancel}
									disabled={updateMeMutation.isPending}
									className='flex-1 py-3 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-dark-border dark:hover:bg-gray-600 text-gray-900 dark:text-dark-text font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
								>
									Hủy
								</button>
							</div>
						</div>
					)}
				</div>
			</form>
		</div>
	)
}

export default AccountInfo
