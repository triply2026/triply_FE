import { create } from 'zustand';

type Member = {
  id: number;
  email: string;
  nickname: string;
};

interface AuthStore {
  member: Member | null;
  logout: () => void;
}

const loadMember = (): Member | null => {
  try {
    const raw = localStorage.getItem('triplyMember');
    return raw ? (JSON.parse(raw) as Member) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  member: loadMember(),
  logout: () => {
    localStorage.removeItem('triplyMember');
    set({ member: null });
  },
}));
