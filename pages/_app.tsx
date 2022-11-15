import 'reflect-metadata'
import '../styles/globals.css'

// fixes a bug for next-auth and mongodb atlas somehow
// https://github.com/nextauthjs/next-auth/issues/833
import { Provider } from 'next-auth/client'
import React from 'react'

function MyApp({ Component, pageProps }) {
  // auth provider
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
