'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { MeResponse } from '@/types/api/auth/me'
import type { Account } from '@/types/models/auth/account'

const Account = {
	getMe: async () => {
		const { data } = await axios.get<Account>('/users/me', {
			withCredentials: true,
		})
		return data
	},
}

export function useGetMe() {
	return useQuery<MeResponse>({
		queryKey: ['account'],
		queryFn: () => Account.getMe(),
	})
}
