import React from 'react'
import registerGSAPPlugins from './config/registerGSAPPlugins'
import { RouterProvider } from 'react-router'
import router from './config/dynamicRouter'
import './i18n'

registerGSAPPlugins()

const App = (): React.ReactNode => {
	return <RouterProvider router={router} />
}

export default App
