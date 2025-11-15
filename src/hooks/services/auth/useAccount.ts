'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/common/axios'
import type { MeResponse } from '@/types/api/auth/me'

const Account = {
	getMe: async () => {
		const { data } = await axios.get<MeResponse>('/users/me')
		return data
	},
}

export function useGetMe() {
	return useQuery<MeResponse>({
		queryKey: ['account'],
		queryFn: () => Account.getMe(),
	})
}
