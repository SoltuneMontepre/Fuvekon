'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { MeResponse } from '@/types/api/auth/me'
import type {
	UpdateMeRequest,
	UpdateMeResponse,
} from '@/types/api/auth/updateMe'
import { useAuthStore } from '@/stores/authStore'
import { getQueryClient } from '@/utils/getQueryClient'

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
}

export function useGetMe() {
	return useQuery<MeResponse>({
		queryKey: ['account'],
		queryFn: () => Account.getMe(),
		retry: false,
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
