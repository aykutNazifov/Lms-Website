import { create } from "zustand";

interface IRegisterModal {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useRegisterModal = create<IRegisterModal>((set) => ({
    isOpen: false,
    open() {
        set({ isOpen: true })
    },
    close() {
        set({ isOpen: false })
    }
}))