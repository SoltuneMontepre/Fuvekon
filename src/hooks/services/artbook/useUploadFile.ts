'use client'

import { useMutation } from '@tanstack/react-query'
import axios from '@/common/axios'
import type {
  UploadArtbookRequest,
  UploadArtbookResponse,
} from '@/types/api/artbook/uploadArtbook.d'
// import { logger } from '@/utils/logger'

export function useUploadArtbook() {
	return useMutation({
		mutationFn: async (payload: UploadArtbookRequest) => {
			const { data } = await axios.general.post<UploadArtbookResponse>(
				'/conbooks/upload',
				payload
			)
			return data
		},
	})
}
