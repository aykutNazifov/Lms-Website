"use client"
import { useLoginModal } from '@/hooks/useLoginModal'
import React, { useEffect, useState } from 'react'
import { BiUser } from 'react-icons/bi'
import { useSelector } from 'react-redux'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { useLogoutQuery, useSocialAuthMutation } from '@/redux/features/auth/authApi'
import toast from 'react-hot-toast'
import { redirect } from 'next/navigation'


const Profile = () => {
    const [logout, setLogout] = useState(false)
    const { open } = useLoginModal()
    const { user } = useSelector((state: any) => state.auth)
    const { data } = useSession()
    const [socialAuth, { isSuccess, error }] = useSocialAuthMutation()
    const { } = useLogoutQuery(undefined, {
        skip: !logout ? true : false
    })

    useEffect(() => {
        if (!user) {
            if (data) {
                socialAuth({ email: data.user?.email, name: data.user?.name, avatar: data.user?.image })
            }
        }

        if (isSuccess) {
            toast.success("You logged in successfully.")
        }
    }, [user, data, isSuccess])


    const handleLogout = async () => {
        setLogout(true);
        await signOut();
        redirect("/");
    }

    return (
        <div>
            {!user ? (

                <div className='flex items-center justify-center text-2xl cursor-pointer' onClick={open}>
                    <BiUser />
                </div>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger><Image src={user?.avatar?.url} alt='User Avatar' width={35} height={35} className='rounded-full' /></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><div onClick={handleLogout} className='cursor-pointer'>Log out</div></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            )}
        </div>
    )
}

export default Profile