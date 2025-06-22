import '../styles/globals.css'
import {NextUIProvider} from "@nextui-org/react";

import { Scrollbar } from 'smooth-scrollbar-react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
export default function App({ Component, pageProps }) {
    return <>
    <Head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="icon" href={'/favicon_ipm.svg'} />


    </Head>
    <Toaster position="bottom-right" toastOptions={{className:'font-sans'}}></Toaster>
    <Scrollbar
    damping={1}
    thumbMinSize={10}
    >
       <NextUIProvider>
      <Component {...pageProps }/></NextUIProvider></Scrollbar></>
}