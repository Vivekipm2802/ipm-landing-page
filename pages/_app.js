import '../styles/globals.css'
import {NextUIProvider} from "@nextui-org/react";
import { Scrollbar } from 'smooth-scrollbar-react'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Script from 'next/script'
import { AuthProvider } from '../hooks/useAuth'
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-16670515724"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'AW-16670515724');`
        }}
      />
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href='/favicon_ipm.svg' />
      </Head>
      <Toaster position="bottom-right" toastOptions={{ className: 'font-sans' }} />
      <Scrollbar damping thumbMinSize>
        <NextUIProvider>
          <AuthProvider>
            <Component {...pageProps} />
            <Analytics />
          </AuthProvider>
        </NextUIProvider>
      </Scrollbar>
    </>
  )
}
