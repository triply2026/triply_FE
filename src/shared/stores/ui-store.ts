import { create } from 'zustand';

interface UIStore {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  isLoginRequiredModalOpen: boolean;
  loginRequiredMessage: string | undefined;
  openLoginRequiredModal: (message?: string) => void;
  closeLoginRequiredModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  isLoginRequiredModalOpen: false,
  loginRequiredMessage: undefined,
  openLoginRequiredModal: (message) => set({ isLoginRequiredModalOpen: true, loginRequiredMessage: message }),
  closeLoginRequiredModal: () => set({ isLoginRequiredModalOpen: false, loginRequiredMessage: undefined }),
}));