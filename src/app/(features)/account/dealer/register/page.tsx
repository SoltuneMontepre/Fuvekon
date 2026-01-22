'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRegisterDealer } from '@/hooks/services/dealer/useDealer'
import ImageUploader from '@/components/common/ImageUploader'
import { Store } from 'lucide-react'

// Validation schema
const DealerRegisterSchema = z.object({
	booth_name: z
		.string()
		.min(1, 'Tên gian hàng là bắt buộc')
		.min(2, 'Tên gian hàng phải có ít nhất 2 ký tự')
		.max(255, 'Tên gian hàng không được vượt quá 255 ký tự'),
	description: z
		.string()
		.min(1, 'Mô tả là bắt buộc')
		.min(10, 'Mô tả phải có ít nhất 10 ký tự')
		.max(500, 'Mô tả không được vượt quá 500 ký tự'),
	price_sheet: z.string().url('URL bảng giá không hợp lệ').min(1, 'Bảng giá là bắt buộc'),
})

type DealerRegisterFormData = z.infer<typeof DealerRegisterSchema>

const DealerRegisterPage = () => {
	const router = useRouter()
	const registerDealerMutation = useRegisterDealer()
	const [priceSheetUrl, setPriceSheetUrl] = useState<string>('')

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		setError,
		clearErrors,
	} = useForm<DealerRegisterFormData>({
		resolver: zodResolver(DealerRegisterSchema),
		defaultValues: {
			booth_name: '',
			description: '',
			price_sheet: '',
		},
	})

	const handlePriceSheetUploadSuccess = useCallback(
		(fileUrl: string) => {
			setPriceSheetUrl(fileUrl)
			setValue('price_sheet', fileUrl)
			clearErrors('price_sheet')
			toast.success('Upload bảng giá thành công!')
		},
		[setValue, clearErrors]
	)

	const handlePriceSheetUploadError = useCallback((error: Error) => {
		setError('price_sheet', {
			type: 'manual',
			message: `Lỗi upload: ${error.message}`,
		})
		toast.error(`Lỗi upload bảng giá: ${error.message}`)
	}, [setError])

	const onSubmit = async (data: DealerRegisterFormData) => {
		if (!priceSheetUrl) {
			setError('price_sheet', {
				type: 'manual',
				message: 'Vui lòng upload bảng giá',
			})
			return
		}

		registerDealerMutation.mutate(
			{
				booth_name: data.booth_name,
				description: data.description,
				price_sheet: priceSheetUrl,
			},
			{
				onSuccess: response => {
					if (response.isSuccess) {
						toast.success('Đăng ký gian hàng thành công!')
						// Redirect to account page after a short delay
						// Account query will be automatically invalidated by the hook
						setTimeout(() => {
							router.push('/account')
						}, 1500)
					} else {
						toast.error(response.message || 'Đăng ký gian hàng thất bại')
					}
				},
				onError: (error: any) => {
					const errorMessage =
						error?.response?.data?.message ||
						error?.message ||
						'Đăng ký gian hàng thất bại. Vui lòng thử lại.'
					toast.error(errorMessage)

					// Handle specific error cases
					if (error?.response?.status === 409) {
						setError('root', {
							type: 'manual',
							message: 'Bạn đã là thành viên của một gian hàng rồi',
						})
					} else if (error?.response?.status === 403) {
						setError('root', {
							type: 'manual',
							message: 'Bạn cần có vé đã được duyệt để đăng ký gian hàng',
						})
					}
				},
			}
		)
	}

	return (
		<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
			<div className='flex items-center gap-3 mb-8'>
				<Store className='w-8 h-8 text-[#48715B]' />
				<h1 className='text-3xl font-bold text-center'>ĐĂNG KÝ GIAN HÀNG</h1>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
				{/* General Error Message */}
				{errors.root && (
					<div
						className='p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
						role='alert'
					>
						{errors.root.message}
					</div>
				)}

				{/* Booth Name */}
				<div>
					<label
						htmlFor='booth_name'
						className='block text-sm font-medium text-[#48715B] mb-2'
					>
						Tên gian hàng <span className='text-red-500'>*</span>
					</label>
					<input
						id='booth_name'
						type='text'
						{...register('booth_name')}
						className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent'
						placeholder='Nhập tên gian hàng của bạn'
						disabled={isSubmitting || registerDealerMutation.isPending}
					/>
					{errors.booth_name && (
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{errors.booth_name.message}
						</p>
					)}
				</div>

				{/* Description */}
				<div>
					<label
						htmlFor='description'
						className='block text-sm font-medium text-[#48715B] mb-2'
					>
						Mô tả gian hàng <span className='text-red-500'>*</span>
					</label>
					<textarea
						id='description'
						{...register('description')}
						rows={5}
						className='w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-base text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:border-transparent resize-none'
						placeholder='Mô tả về gian hàng của bạn, sản phẩm, dịch vụ...'
						disabled={isSubmitting || registerDealerMutation.isPending}
					/>
					{errors.description && (
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{errors.description.message}
						</p>
					)}
					<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
						{register('description').ref?.value?.length || 0}/500 ký tự
					</p>
				</div>

				{/* Price Sheet Upload */}
				<div>
					<label className='block text-sm font-medium text-[#48715B] mb-2'>
						Bảng giá <span className='text-red-500'>*</span>
					</label>
					<ImageUploader
						onUploadSuccess={handlePriceSheetUploadSuccess}
						onUploadError={handlePriceSheetUploadError}
						folder='dealer-price-sheets'
						maxSizeMB={10}
						accept='image/*'
						initialImageUrl={priceSheetUrl}
						showPreview={true}
						buttonText='Chọn ảnh bảng giá'
						label='Upload ảnh bảng giá của bạn (JPG, PNG, max 10MB)'
						disabled={isSubmitting || registerDealerMutation.isPending}
					/>
					{errors.price_sheet && (
						<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
							{errors.price_sheet.message}
						</p>
					)}
					<p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
						Vui lòng upload ảnh bảng giá của gian hàng. Ảnh sẽ được hiển thị cho
						người dùng xem.
					</p>
				</div>

				{/* Submit Button */}
				<div className='pt-4'>
					<button
						type='submit'
						disabled={isSubmitting || registerDealerMutation.isPending}
						className='w-full py-3 px-4 rounded-lg bg-[#48715B] text-white font-medium transition-colors duration-200 hover:bg-[#3a5a4a] focus:outline-none focus:ring-2 focus:ring-[#48715B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md'
					>
						{isSubmitting || registerDealerMutation.isPending
							? 'Đang đăng ký...'
							: 'Đăng ký gian hàng'}
					</button>
				</div>

				{/* Info Note */}
				<div className='mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
					<p className='text-sm text-blue-700 dark:text-blue-400'>
						<strong>Lưu ý:</strong> Bạn cần có vé đã được duyệt để đăng ký gian hàng.
						Gian hàng của bạn sẽ cần được quản trị viên xác minh trước khi được hiển
						thị công khai.
					</p>
				</div>
			</form>
		</div>
	)
}

export default DealerRegisterPage
