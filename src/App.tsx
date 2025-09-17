import React from 'react'
import registerGSAPPlugins from './config/registerGSAPPlugins'
import { RouterProvider } from 'react-router'
import router from './config/dynamicRouter'
import './config/i18n'
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'

registerGSAPPlugins()

const App = (): React.ReactNode => {
	const client = useQueryClient()

	return (
		<QueryClientProvider client={client}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	)
}

export default App
