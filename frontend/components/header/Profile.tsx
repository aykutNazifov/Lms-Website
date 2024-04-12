"use client"
import { useLoginModal } from '@/hooks/useLoginModal'
import React from 'react'
import { BiUser } from 'react-icons/bi'

const Profile = () => {
    const { open } = useLoginModal()
    return (
        <div>
            <div className='flex items-center justify-center text-2xl cursor-pointer' onClick={open}>
                <BiUser />
            </div>
        </div>
    )
}

export default Profile