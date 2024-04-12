

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const navItemsData = [
    {
        name: "Home",
        url: "/"
    },
    {
        name: "Courses",
        url: "/courses"
    },
    {
        name: "About",
        url: "/about"
    },
    {
        name: "Policy",
        url: "/policy"
    },
    {
        name: "FAQ",
        url: "/faq"
    },
]

const NavItems = () => {
    const pathname = usePathname()

    return (
        <div className='hidden md:flex gap-x-4'>
            {navItemsData.map(navItem => (
                <Link key={navItem.name} href={navItem.url} className={pathname === navItem.url ? "text-green-900 dark:text-green-400 font-bold" : ""}>{navItem.name}</Link>
            ))}
        </div>
    )
}

export default NavItems