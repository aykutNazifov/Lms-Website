"use client"

import React from 'react'
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

const schema = Yup.object().shape({
    email: Yup.string().email("Invalid email.").required("Email is required."),
    password: Yup.string().required("Password is required.").min(6)
})

const LoginModal = () => {
    const { isOpen, close } = useLoginModal()

    const formik = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: schema,
        onSubmit: async ({ email, password }) => {
            console.log({ email, password })
        }
    })

    const { errors, touched, values, handleChange, handleSubmit } = formik

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
                            <DialogFooter>
                                <Button type='submit' >Save changes</Button>
                                <Button type='button' onClick={close}>Close</Button>
                            </DialogFooter>
                        </form>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default LoginModal