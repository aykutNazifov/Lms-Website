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
import { Button } from '../ui/button'
import { useRegisterModal } from '@/hooks/useRegisterModal'
import { useLoginModal } from '@/hooks/useLoginModal'
import { AiFillGithub } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { Input } from '../ui/input'
import { useVerificationModal } from '@/hooks/useVerificationModal'
import { useRegisterMutation } from '@/redux/features/auth/authApi'
import toast from 'react-hot-toast'

const schema = Yup.object().shape({
    name: Yup.string().required("Name is required."),
    email: Yup.string().email("Invalid email.").required("Email is required."),
    password: Yup.string().required("Password is required.").min(6)
})

interface IMuattionError {
    data: {
        message: string
    }
}

const RegisterModal = () => {
    const { isOpen, close } = useRegisterModal()
    const loginModal = useLoginModal()
    const verificationModal = useVerificationModal()
    const [register, { isError, data, isSuccess, error }] = useRegisterMutation()

    useEffect(() => {
        if (isSuccess) {
            const message = data?.message || "Registration successfull."
            toast.success(message)
            close()
            verificationModal.open()
        }

        if (error) {
            if ("data" in error) {
                const errorData = error as IMuattionError
                toast.error(errorData?.data?.message || "Something went wrong!")
            }
        }
    }, [isSuccess, error])

    const formik = useFormik({
        initialValues: { name: "", email: "", password: "" },
        validationSchema: schema,
        onSubmit: async ({ name, email, password }) => {
            const data = { name, email, password }
            await register(data)
        }
    })

    const { errors, touched, values, handleChange, handleSubmit } = formik

    const handleSignUpClick = () => {
        close()
        loginModal.open()
    }

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={close}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>LoMS Register</DialogTitle>
                        <DialogDescription>
                            Sign up and explore our courses.
                        </DialogDescription>
                    </DialogHeader>
                    <div >
                        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
                            <div>
                                <Input className={`${errors.name && touched.name ? "border-red-500" : ""}`} value={values.name} onChange={handleChange} id="name" placeholder='Name' />
                                {errors.name && touched.name && (
                                    <span className='text-red-500 text-sm'>{errors.name}</span>
                                )}
                            </div>
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
                            <div>Already have an account? <span onClick={handleSignUpClick} className='underline cursor-pointer'>Sign in</span></div>
                            <DialogFooter>
                                <Button type='submit' >Sign up</Button>
                            </DialogFooter>
                            <div className='flex items-center justify-center gap-4 flex-col'>
                                <div className='text-2xl'>Or join with</div>
                                <div className='flex items-center text-2xl gap-4'>
                                    <div className='cursor-pointer'><FcGoogle /></div>
                                    <div className='cursor-pointer'><AiFillGithub /></div>
                                </div>
                            </div>
                        </form>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default RegisterModal