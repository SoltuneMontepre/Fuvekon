'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateMe, useUpdateAvatar } from '@/hooks/services/auth/useAccount'
import ImageUploader from '@/components/common/ImageUploader'
import S3Image from '@/components/common/S3Image'
import { getNames, getCode, getName } from 'country-list'

const COUNTRY_NAMES = () => getNames()

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
}) => {
	const hasValue = (value || '').trim().length > 0
	if (editable && name) {
		return (
			<div className='relative w-full'>
				<input
					type='text'
					id={`${name}-input`}
					name={name}
					value={value || ''}
					onChange={onChange}
					className='block w-full px-3 py-2 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal placeholder-transparent focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none peer'
					placeholder={label}
				/>
				<label
					htmlFor={`${name}-input`}
					className={`absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70  px-1 transition-all duration-200 pointer-events-none ${hasValue ? 'scale-70 -translate-y-8 sm:-translate-y-9' : 'peer-focus:scale-70 peer-focus:-translate-y-8 sm:peer-focus:-translate-y-9'}`}
					style={{ transformOrigin: 'left' }}
				>
					{label}:
				</label>
			</div>
		)
	}
	return (
		<div className='space-y-1'>
			<label className='text-xs font-medium text-[#48715B]'>{label}</label>
			<div className='text-sm text-text-secondary'>{value || 'N/A'}</div>
		</div>
	)
}

const AccountPage = () => {
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

	const handleAvatarRemove = useCallback(() => {
		updateAvatarMutation.mutate(
			{ avatar: '' },
			{
				onSuccess: data => {
					if (data.isSuccess) {
						toast.success('Đã xóa ảnh đại diện.')
					}
				},
				onError: () => {
					toast.error('Xóa ảnh đại diện thất bại. Vui lòng thử lại.')
				},
			}
		)
	}, [updateAvatarMutation])

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
			<div className='flex items-center justify-center min-h-[200px]'>
				<div className='text-sm text-gray-500 dark:text-dark-text-secondary'>
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
				country: getCode(formData.country) || undefined,
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
		<div className='rounded-2xl bg-[#E9F5E7] p-5 shadow-sm text-text-secondary'>
			<h1 className='text-2xl font-bold mb-4 text-center'>TÀI KHOẢN</h1>

			<div className='flex flex-col gap-5'>
				{/* Avatar Section */}
				<div className='flex-shrink-0'>
					<label className='block text-xs font-medium text-[#48715B] mb-2'>
						Ảnh đại diện
					</label>
					<div className='flex items-center gap-3'>
						<div className='relative w-34 h-34 rounded-full overflow-hidden border-2 border-[#48715B]/30 bg-[#E2EEE2] flex-shrink-0'>
							{account.avatar ? (
								<S3Image
									src={account.avatar}
									alt={account.fursona_name || account.first_name || 'Avatar'}
									fill
									className='object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center text-[#48715B] text-xl font-bold'>
									{(
										account.fursona_name ||
										account.first_name ||
										account.email?.charAt(0) ||
										'U'
									)
										.charAt(0)
										.toUpperCase()}
								</div>
							)}
						</div>
						<div className='flex-shrink-0'>
							<ImageUploader
								buttonText='Chọn ảnh'
								initialImageUrl={account.avatar}
								onUploadSuccess={handleAvatarUploadSuccess}
								onRemove={handleAvatarRemove}
								onUploadError={error => {
									toast.error(`Lỗi upload: ${error.message}`)
								}}
								folder='user-uploads'
								maxSizeMB={10}
								showPreview={false}
								disabled={updateAvatarMutation.isPending}
								compressImage
								accept='image/png,image/jpeg,image/jpg'
							/>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className='flex-1 min-w-0'>
					<div className='space-y-5'>
						{isEditing ? (
							<>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
									<InfoField
										label='Tên fursona'
										value={formData.fursona_name}
										name='fursona_name'
										editable={isEditing}
										onChange={handleInputChange}
									/>
									<InfoField label='Gmail' value={account.email} />
								</div>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
									<div className='relative w-full'>
										<label
											htmlFor='country-select'
											className='absolute left-3 top-2.5 sm:top-3 text-lg sm:text-xl font-normal text-[#8C8C8C]/70 bg-[#E2EEE2] px-1 transition-all duration-200 pointer-events-none scale-70 -translate-y-8 sm:-translate-y-9'
											style={{ transformOrigin: 'left' }}
										>
											Quốc gia:
										</label>
										<select
											id='country-select'
											value={getName(formData.country)}
											onChange={e =>
												setFormData(prev => ({
													...prev,
													country: e.target.value,
												}))
											}
											className='block w-full px-3 py-2.5 sm:py-3 rounded-xl bg-[#E2EEE2] border border-[#8C8C8C]/30 text-[#8C8C8C] text-lg sm:text-xl font-normal focus:outline-none focus:border-[#48715B] focus:ring-0 shadow-none appearance-none cursor-pointer'
										>
											<option value='' disabled>
												Chọn quốc gia
											</option>
											{COUNTRY_NAMES().map(c => (
												<option key={c} value={c}>
													{c}
												</option>
											))}
											{formData.country &&
												!COUNTRY_NAMES().includes(formData.country) && (
													<option value={formData.country}>
														{formData.country}
													</option>
												)}
										</select>
									</div>
									<InfoField
										label='Số CMND/CCCD'
										value={formData.id_card}
										name='id_card'
										editable={isEditing}
										onChange={handleInputChange}
									/>
								</div>
							</>
						) : (
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
								<InfoField label='Họ và Tên' value={fullName} />
								<InfoField label='Tên fursona' value={account.fursona_name} />
								<InfoField label='Gmail' value={account.email} />
								<InfoField
									label='Quốc gia'
									value={getName(account.country || '')}
								/>
								<InfoField label='Số CMND/CCCD' value={account.id_card} />
							</div>
						)}
					</div>

					{/* Edit / Save actions */}
					<div className='mt-4 pt-4 border-t border-[#48715B]/20'>
						{!isEditing ? (
							<button
								type='button'
								onClick={() => {
									setFormData({
										first_name: account.first_name || '',
										last_name: account.last_name || '',
										fursona_name: account.fursona_name || '',
										country: account.country || '',
										id_card: account.id_card || '',
									})
									setIsEditing(true)
								}}
								className='shadow-md w-full py-2 px-3 text-sm rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface'
							>
								Chỉnh sửa thông tin
							</button>
						) : (
							<div className='flex gap-3'>
								<button
									type='submit'
									disabled={updateMeMutation.isPending}
									className='shadow-md flex-1 py-2 px-3 text-sm rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{updateMeMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
								</button>
								<button
									type='button'
									onClick={handleCancel}
									disabled={updateMeMutation.isPending}
									className='shadow-md flex-1 py-2 px-3 text-sm rounded-lg bg-bg text-text-secondary font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed'
								>
									Hủy
								</button>
							</div>
						)}
					</div>
				</form>
			</div>
		</div>
	)
}

export default AccountPage
