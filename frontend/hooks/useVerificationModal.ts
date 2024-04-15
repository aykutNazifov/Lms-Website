import { create } from "zustand";

interface IVerificationModal {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useVerificationModal = create<IVerificationModal>((set) => ({
    isOpen: false,
    open() {
        set({ isOpen: true })
    },
    close() {
        set({ isOpen: false })
    }
}))