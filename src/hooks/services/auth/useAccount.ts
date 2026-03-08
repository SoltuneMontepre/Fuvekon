'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { MeResponse } from '@/types/api/auth/me'
import type {
	UpdateMeRequest,
	UpdateMeResponse,
} from '@/types/api/auth/updateMe'
import type {
	UpdateAvatarRequest,
	UpdateAvatarResponse,
} from '@/types/api/auth/updateAvatar'
import type {
	ChangePasswordRequest,
	ChangePasswordResponse,
} from '@/types/api/auth/changePassword'
import type { ApiResponse } from '@/types/api/response'
import { useAuthStore } from '@/stores/authStore'
import { getQueryClient } from '@/utils/getQueryClient'

export type VerifyOtpRequest = { email: string; otp: string }
export type ResendOtpRequest = { email: string }

const Account = {
	getMe: async () => {
		const { data } = await axios.general.get<MeResponse>('/users/me')
		return data
	},
	updateMe: async (payload: UpdateMeRequest) => {
		const { data } = await axios.general.put<UpdateMeResponse>(
			'/users/me',
			payload
		)
		return data
	},
	updateAvatar: async (payload: UpdateAvatarRequest) => {
		const { data } = await axios.general.patch<UpdateAvatarResponse>(
			'/users/me/avatar',
			payload
		)
		return data
	},
	changePassword: async (payload: ChangePasswordRequest) => {
		const { data } = await axios.general.post<ChangePasswordResponse>(
			'/auth/reset-password',
			payload
		)
		return data
	},
	verifyOtp: async (payload: VerifyOtpRequest) => {
		const { data } = await axios.general.post<ApiResponse<null>>(
			'/auth/verify-otp',
			payload
		)
		return data
	},
	resendOtp: async (payload: ResendOtpRequest) => {
		const { data } = await axios.general.post<ApiResponse<null>>(
			'/auth/resend-otp',
			payload
		)
		return data
	},
}

export function useGetMe() {
	const isAuthenticated = useAuthStore(state => state.isAuthenticated)

	return useQuery<MeResponse>({
		queryKey: ['account'],
		queryFn: () => Account.getMe(),
		enabled: isAuthenticated, // Only run query if user is authenticated
		retry: false,
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		refetchOnWindowFocus: false, // Don't refetch on window focus
		refetchOnMount: false, // Don't refetch on component mount if data exists
		refetchOnReconnect: false, // Don't refetch on reconnect
	})
}

export function useUpdateMe() {
	const queryClient = getQueryClient()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: async (payload: UpdateMeRequest) => {
			return Account.updateMe(payload)
		},
		onSuccess: data => {
			if (data.isSuccess && data.data) {
				setAccount(data.data)
			}
			queryClient.invalidateQueries({ queryKey: ['account'] })
		},
	})
}

export function useUpdateAvatar() {
	const queryClient = getQueryClient()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: async (payload: UpdateAvatarRequest) => {
			return Account.updateAvatar(payload)
		},
		onSuccess: data => {
			if (data.isSuccess && data.data) {
				setAccount(data.data)
			}
			queryClient.invalidateQueries({ queryKey: ['account'] })
		},
	})
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (payload: ChangePasswordRequest) =>
			Account.changePassword(payload),
	})
}

export function useVerifyOtp() {
	const queryClient = getQueryClient()
	const setAccount = useAuthStore(state => state.setAccount)

	return useMutation({
		mutationFn: (payload: VerifyOtpRequest) => Account.verifyOtp(payload),
		onSuccess: async () => {
			try {
 				const me = await Account.getMe()
 				if (me?.isSuccess && me.data) {
 					setAccount(me.data)
 					queryClient.setQueryData(['account'], me)
 				}
			} catch {
				queryClient.invalidateQueries({ queryKey: ['account'] })
			}
		},
	})
}

export function useResendOtp() {
	return useMutation({
		mutationFn: (payload: ResendOtpRequest) => Account.resendOtp(payload),
	})
}
