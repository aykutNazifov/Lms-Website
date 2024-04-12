"use client"

import { useTheme } from "next-themes"
import { BiMoon, BiSun } from "react-icons/bi"
const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()
    return (
        <div className="flex items-center justify-center text-2xl cursor-pointer" onClick={() => theme === "dark" ? setTheme("light") : setTheme("dark")}>
            {theme === "dark" ? <BiMoon /> : <BiSun />}
        </div>
    )
}

export default ThemeSwitcher