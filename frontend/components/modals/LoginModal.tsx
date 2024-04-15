"use client"

import React, { useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useLoginModal } from '@/hooks/useLoginModal'
import { Button } from '../ui/button'
import { AiFillGithub } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { Input } from '../ui/input'
import { useRegisterModal } from '@/hooks/useRegisterModal'
import { useLoginMutation } from '@/redux/features/auth/authApi'
import toast from 'react-hot-toast'
import { signIn } from 'next-auth/react'

const schema = Yup.object().shape({
    email: Yup.string().email("Invalid email.").required("Email is required."),
    password: Yup.string().required("Password is required.").min(6)
})


const LoginModal = () => {
    const { isOpen, close } = useLoginModal()
    const registerModal = useRegisterModal()
    const [login, { isSuccess, error, data }] = useLoginMutation()

    useEffect(() => {
        if (isSuccess) {
            toast.success("You logged in successfully.")
            close()
        }

        if (error) {
            if ("data" in error) {
                const errorData = error as any
                toast.error(errorData?.data?.message || "Something went wrong!")
            }
        }
    }, [isSuccess, error])

    const formik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: schema,
        onSubmit: async ({ email, password }) => {
            await login({ email, password })
        }
    })

    const { errors, touched, values, handleChange, handleSubmit } = formik

    const handleSignUpClick = () => {
        close()
        registerModal.open()
    }

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={close}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>LoMS Login</DialogTitle>
                        <DialogDescription>
                            Login and explore our courses.
                        </DialogDescription>
                    </DialogHeader>
                    <div >
                        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
                            <div>
                                <Input className={`${errors.email && touched.email ? "border-red-500" : ""}`} value={values.email} onChange={handleChange} id="email" placeholder='Email' />
                                {errors.email && touched.email && (
                                    <span className='text-red-500 text-sm'>{errors.email}</span>
                                )}
                            </div>
                            <div>
                                <Input className={`${errors.password && touched.password ? "border-red-500" : ""}`} value={values.password} onChange={handleChange} id="password" placeholder='Password' type='password' />
                                {errors.password && touched.password && (
                                    <span className='text-red-500 text-sm'>{errors.password}</span>
                                )}
                            </div>
                            <div>Dont have an account? <span onClick={handleSignUpClick} className='underline cursor-pointer'>Sing up</span></div>
                            <DialogFooter>
                                <Button type='submit' >Login</Button>
                            </DialogFooter>
                            <div className='flex items-center justify-center gap-4 flex-col'>
                                <div className='text-2xl'>Or join with</div>
                                <div className='flex items-center text-2xl gap-4'>
                                    <div className='cursor-pointer'><FcGoogle /></div>
                                    <div onClick={() => signIn("github")} className='cursor-pointer'><AiFillGithub /></div>
                                </div>
                            </div>
                        </form>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default LoginModal