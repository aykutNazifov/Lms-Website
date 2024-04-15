"use client"

import { store } from '@/redux/store'
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { Provider } from 'react-redux'

interface IProvider {
    children: React.ReactNode
}

export const Providers: React.FC<IProvider> = ({ children }) => {
    return (
        <SessionProvider>
            <Provider store={store}>
                {children}
            </Provider>
        </SessionProvider>
    )
}
