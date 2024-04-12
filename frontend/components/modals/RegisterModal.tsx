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
import { Button } from '../ui/button'
import { useRegisterModal } from '@/hooks/useRegisterModal'

const RegisterModal = () => {
    const { isOpen, close } = useRegisterModal()

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={close}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dialog Register</DialogTitle>
                        <DialogDescription>
                            Dialog descpription.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        Test Dialog
                    </div>
                    <DialogFooter>
                        <Button>Save changes</Button>
                        <Button onClick={close}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default RegisterModal