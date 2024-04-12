"use client"
import LoginModal from '@/components/modals/LoginModal'
import React, { useEffect, useState } from 'react'

const ModalsProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }


    return (
        <>
            <LoginModal />
        </>
    )
}

export default ModalsProvider