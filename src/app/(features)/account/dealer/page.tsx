'use client'

import React from 'react'
import { useGetMyDealer } from '@/hooks/services/dealer/useDealer'
import { useAuthStore } from '@/stores/authStore'
import { Store, CheckCircle, XCircle, UserCheck, Users } from 'lucide-react'
import S3Image from '@/components/common/S3Image'
import Loading from '@/components/common/Loading'
import type { DealerStaff } from '@/types/models/dealer/dealer'

const DealerPage = () => {
	const account = useAuthStore(state => state.account)
	const isDealer = account?.is_dealer || false
	const { data: myDealerData, isLoading: isLoadingDealer } =
		useGetMyDealer(isDealer)

	const myDealer = myDealerData?.data

	// If user is not a dealer, show message immediately
	if (!isDealer) {
		return (
			<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
				<div className='flex items-center gap-3 mb-8'>
					<Store className='w-8 h-8 text-[#48715B]' />
					<h1 className='text-3xl font-bold text-center'>GIAN HÀNG</h1>
				</div>
				<div className='text-center py-12'>
					<p className='text-lg text-[#48715B] mb-4'>Bạn chưa có gian hàng</p>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Vui lòng đăng ký hoặc tham gia một gian hàng để xem thông tin tại
						đây.
					</p>
				</div>
			</div>
		)
	}

	// Show loading while fetching dealer data
	if (isLoadingDealer) {
		return (
			<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
				<Loading />
			</div>
		)
	}

	// If user doesn't have a booth, show message
	if (!myDealer) {
		return (
			<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
				<div className='flex items-center gap-3 mb-8'>
					<Store className='w-8 h-8 text-[#48715B]' />
					<h1 className='text-3xl font-bold text-center'>GIAN HÀNG</h1>
				</div>
				<div className='text-center py-12'>
					<p className='text-lg text-[#48715B] mb-4'>Bạn chưa có gian hàng</p>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Vui lòng đăng ký hoặc tham gia một gian hàng để xem thông tin tại
						đây.
					</p>
				</div>
			</div>
		)
	}

	const staffs = myDealer.staffs || []
	const isOwner =
		staffs.some(
			(staff: DealerStaff) => staff.user_id === account?.id && staff.is_owner
		) || false
	const currentUserStaff = staffs.find(
		(staff: DealerStaff) => staff.user_id === account?.id
	)

	return (
		<div className='rounded-[30px] bg-[#E9F5E7] p-8 shadow-sm text-text-secondary'>
			<div className='flex items-center gap-3 mb-8'>
				<Store className='w-8 h-8 text-[#48715B]' />
				<h1 className='text-3xl font-bold text-center'>GIAN HÀNG CỦA TÔI</h1>
			</div>

			<div className='space-y-6'>
				{/* Booth Information Card */}
				<div className='p-6 rounded-lg'>
					<div className='flex items-start justify-between mb-4'>
						<div>
							<h2 className='text-2xl font-bold text-[#48715B] mb-2'>
								{myDealer.booth_name}
							</h2>
							<div className='flex items-center gap-2 mt-2'>
								{isOwner && (
									<span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium'>
										<UserCheck className='w-4 h-4' />
										Chủ gian hàng
									</span>
								)}
								{!isOwner && currentUserStaff && (
									<span className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium'>
										<Users className='w-4 h-4' />
										Nhân viên
									</span>
								)}
							</div>
						</div>
						<div className='flex items-center gap-2'>
							{myDealer.is_verified ? (
								<span className='inline-flex items-center gap-1 px-3 py-1 rounded-full dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium'>
									<CheckCircle className='w-4 h-4' />
									Đã xác minh
								</span>
							) : (
								<span className='inline-flex items-center gap-1 px-3 py-1 rounded-full  dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium'>
									<XCircle className='w-4 h-4' />
									Chưa xác minh
								</span>
							)}
						</div>
					</div>

					{/* Booth Code */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-[#48715B] mb-2'>
							Mã gian hàng
						</label>
						<div className='px-4 py-3 rounded-lg'>
							<code className='text-lg font-mono font-bold text-[#48715B]'>
								{myDealer.booth_number}
							</code>
						</div>
					</div>

					{/* Description */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-[#48715B] mb-2'>
							Mô tả
						</label>
						<p className='text-base text-gray-700 dark:text-gray-300'>
							{myDealer.description}
						</p>
					</div>

					{/* Price Sheet */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-[#48715B] mb-2'>
							Bảng giá
						</label>
						{myDealer.price_sheet && (
							<div className='relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'>
								<S3Image
									src={myDealer.price_sheet}
									alt='Bảng giá'
									fill
									className='object-contain'
								/>
							</div>
						)}
					</div>

					{/* Staff Members */}
					{staffs.length > 0 && (
						<div>
							<label className='block text-sm font-medium text-[#48715B] mb-2'>
								Thành viên ({staffs.length})
							</label>
							<div className='space-y-2'>
								{staffs.map((staff: DealerStaff) => (
									<div
										key={staff.id}
										className='flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
									>
										<div className='flex items-center gap-3'>
											<div className='w-10 h-10 rounded-full bg-[#48715B] flex items-center justify-center text-white font-semibold'>
												{staff.user_name?.charAt(0).toUpperCase() || 'U'}
											</div>
											<div>
												<p className='font-medium text-gray-900 dark:text-gray-100'>
													{staff.user_name}
												</p>
												<p className='text-sm text-gray-500 dark:text-gray-400'>
													{staff.user_email}
												</p>
											</div>
										</div>
										{staff.is_owner && (
											<span className='px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'>
												Chủ
											</span>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DealerPage
