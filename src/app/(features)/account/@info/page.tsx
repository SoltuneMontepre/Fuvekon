'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateMe, useUpdateAvatar } from '@/hooks/services/auth/useAccount'
import ImageUploader from '@/components/common/ImageUploader'
import S3Image from '@/components/common/S3Image'

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
	<div className=''>
		<label className='text-sm font-medium text-text-secondary'>{label}</label>
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
			<div className='text-base text-text-secondary'>{value || 'N/A'}</div>
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
		id_card: '',
	})
	const updateMeMutation = useUpdateMe()
	const updateAvatarMutation = useUpdateAvatar()

	const handleAvatarUploadSuccess = useCallback(
		(fileUrl: string) => {
			updateAvatarMutation.mutate(
				{ avatar: fileUrl },
				{
					onSuccess: data => {
						if (data.isSuccess) {
							toast.success('Cập nhật avatar thành công!')
						}
					},
					onError: () => {
						toast.error('Cập nhật avatar thất bại. Vui lòng thử lại.')
					},
				}
			)
		},
		[updateAvatarMutation]
	)

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
				id_card: account.id_card || '',
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
			id_card: account.id_card || '',
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
				id_card: formData.id_card || undefined,
			},
			{
				onSuccess: data => {
					if (data.isSuccess) {
						setIsEditing(false)
						toast.success('Cập nhật thông tin thành công!')
					}
				},
				onError: () => {
					toast.error('Cập nhật thất bại. Vui lòng thử lại.')
				},
			}
		)
	}

	return (
		<div className='rounded-[30px]  bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
			<h1 className='text-3xl font-bold mb-8 text-center'>TÀI KHOẢN</h1>
			
			{/* Avatar Section */}
			<div className='mb-8 mx-auto'>
				<label className='block text-sm font-medium text-[#48715B] mb-4'>Ảnh đại diện</label>
				<div className='flex items-center gap-4'>
					{/* Profile Avatar Display */}
					<div className='relative w-64 h-64 rounded-full overflow-hidden border-2 border-[#48715B]/30 bg-[#E2EEE2] flex-shrink-0'>
						{account.avatar ? (
							<S3Image
								src={account.avatar}
								alt={account.fursona_name || account.first_name || 'Avatar'}
								fill
								className='object-cover'
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center text-[#48715B] text-4xl font-bold'>
								{(account.fursona_name || account.first_name || account.email?.charAt(0) || 'U').charAt(0).toUpperCase()}
							</div>
						)}
					</div>
					{/* Upload Controls */}
					<div className='flex-shrink-0'>
						<ImageUploader
							buttonText='Chọn ảnh đại diện'
							initialImageUrl={account.avatar}
							onUploadSuccess={handleAvatarUploadSuccess}
							onUploadError={error => {
								toast.error(`Lỗi upload: ${error.message}`)
							}}
							folder='user-uploads'
							maxSizeMB={10}
							showPreview={false}
							disabled={updateAvatarMutation.isPending}
						/>
					</div>
				</div>
			</div>

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
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-6'>
									<InfoField
										label='Tên fursona'
										value={formData.fursona_name}
										name='fursona_name'
										editable={isEditing}
										onChange={handleInputChange}
									/>
									<InfoField label='Gmail' value={account.email} />
								</div>
								<div className='space-y-6'>
									<InfoField
										label='Quốc gia'
										value={formData.country}
										name='country'
										editable={isEditing}
										onChange={handleInputChange}
									/>
									<InfoField
										label='Số CMND/CCCD'
										value={formData.id_card}
										name='id_card'
										editable={isEditing}
										onChange={handleInputChange}
									/>
								</div>
							</div>
						</>
					) : (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-6'>
							<InfoField label='Họ và Tên' value={fullName} />
							<InfoField label='Tên fursona' value={account.fursona_name} />
							<InfoField label='Gmail' value={account.email} />
						</div>
						<div className='space-y-6'>
							<InfoField label='Quốc gia' value={account.country} />
							<InfoField label='Số CMND/CCCD' value={account.id_card} />
						</div>
					</div>
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
									id_card: account.id_card || '',
								})
								setIsEditing(true)
							}}
							className='shadow-md w-full py-3 px-4 rounded-lg bg-bg  text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface'
						>
							Chỉnh sửa thông tin
						</button>
					) : (
						<div className='space-y-4'>
							<div className='flex gap-4'>
								<button
									type='submit'
									disabled={updateMeMutation.isPending}
									className='shadow-md flex-1 py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{updateMeMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
								</button>
								<button
									type='button'
									onClick={handleCancel}
									disabled={updateMeMutation.isPending}
									className='shadow-md flex-1 py-3 px-4 rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
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
