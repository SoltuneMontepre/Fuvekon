import React from 'react'

type LoginLayoutProps = {
	form: React.ReactElement
}

const LoginLayout = ({ form }: LoginLayoutProps): React.ReactElement => {
	return <>{form}</>
}

export default LoginLayout
