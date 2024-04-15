"use client"

import React, { useEffect, useRef, useState } from 'react'
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
import { Input } from '../ui/input'
import { useRegisterModal } from '@/hooks/useRegisterModal'
import { useVerificationModal } from '@/hooks/useVerificationModal'
import toast from 'react-hot-toast'
import { VscWorkspaceTrusted } from 'react-icons/vsc'
import { useSelector } from 'react-redux'
import { Anybody } from 'next/font/google'
import { useActivationMutation } from '@/redux/features/auth/authApi'


const VerificationModal = () => {
    const { isOpen, close } = useVerificationModal()
    const registerModal = useRegisterModal()
    const { token } = useSelector((state: any) => state.auth)
    const [activation, { isSuccess, error }] = useActivationMutation()
    const [verifyNumber, setVerifyNumber] = useState<Record<number, string>>({
        0: "",
        1: "",
        2: "",
        3: ""
    })
    const [invalidError, setInvalidError] = useState(false)
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ]

    useEffect(() => {
        if (isSuccess) {
            toast.success("Account activated successfully");
            close()
        }
        if (error) {
            const errorData = error as any
            toast.error(errorData.data?.message || "Something went wrong!")
        }
    }, [error, isSuccess])

    const verificationHandler = async () => {
        const verificationNumber = Object.values(verifyNumber).join("")

        if (verificationNumber.length !== 4) {
            setInvalidError(true);
            return;
        }
        await activation({
            activationToken: token,
            activationCode: verificationNumber
        })
    }

    const handleInputChange = (index: number, value: string) => {
        setInvalidError(false)
        setVerifyNumber({ ...verifyNumber, [index]: value })
        if (value === "" && index > 0) {
            inputRefs[index - 1].current?.focus()
        } else if (value.length === 1 && index < 3) {
            inputRefs[index + 1].current?.focus()
        }
    }


    return (
        <div>
            <Dialog open={isOpen} onOpenChange={close}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>LoMS Verification</DialogTitle>
                        <DialogDescription>
                            Verify Your Account
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <div className='flex items-center justify-center text-5xl my-6'>
                            <VscWorkspaceTrusted />
                        </div>
                        <div className='flex items-center justify-center gap-3'>
                            {Object.keys(verifyNumber).map((item, index) => (
                                <Input
                                    className={`w-[65px] h-[65px] text-xl ${invalidError && "border-red-500"}`}
                                    type='number'
                                    key={index}
                                    ref={inputRefs[index]}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    maxLength={1}
                                    value={verifyNumber[index]}
                                />
                            ))}
                        </div>
                        <div className='flex justify-center my-6'>
                            <Button onClick={verificationHandler}>Verify OTP</Button>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default VerificationModal