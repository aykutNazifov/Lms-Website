"use client"
import React, { useState } from 'react'
import Logo from '../Logo'
import NavItems from './NavItems'
import ThemeSwitcher from './ThemeSwitcher'
import { BiUser } from 'react-icons/bi'
import Profile from './Profile'
import { useSelector } from 'react-redux'

const Header = () => {
    const [open, setOpen] = useState(false)

    return (
        <header className='w-full relative h-24 flex items-center border-b dark:border-b-white border-b-neutral-700'>
            <div className='container mx-auto px-10 flex items-center justify-between'>
                <div>
                    <Logo />
                </div>
                <nav className='flex gap-x-4'>
                    <NavItems />
                    <ThemeSwitcher />
                    <Profile />
                </nav>
            </div>
        </header>
    )
}

export default Header