'use client'

import React from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useTranslations } from 'next-intl'

export type GoogleLoginButtonProps = {
	onSuccess: (credential: string) => void
	onError?: () => void
	disabled?: boolean
	className?: string
}

const GoogleLoginButton = ({
	onSuccess,
	onError,
	disabled = false,
	className = '',
}: GoogleLoginButtonProps): React.ReactElement => {
	const t = useTranslations('auth')

	const handleSuccess = (response: CredentialResponse) => {
		if (response.credential) {
			onSuccess(response.credential)
		} else {
			onError?.()
		}
	}

	return (
		<div
			className={className}
			style={disabled ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
		>
			<GoogleLogin
				onSuccess={handleSuccess}
				onError={onError}
				useOneTap={false}
				text='continue_with'
				shape='rectangular'
				theme='outline'
				size='large'
			/>
		</div>
	)
}

export default GoogleLoginButton
