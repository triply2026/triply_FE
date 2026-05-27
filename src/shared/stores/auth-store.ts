import { logout as apiLogout } from '@apis/auth';
import { create } from 'zustand';

type Member = {
  id: number;
  email: string;
  nickname: string;
};

interface AuthStore {
  member: Member | null;
  setMember: (member: Member) => void;
  logout: (redirectToLogin?: boolean) => Promise<void>;
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
  setMember: (member: Member) => {
    localStorage.setItem('triplyMember', JSON.stringify(member));
    set({ member });
  },
  logout: async (redirectToLogin = true) => {
    try {
      await apiLogout();
    } catch {
      // 서버 오류가 나도 클라이언트는 초기화
    }
    localStorage.removeItem('triplyMember');
    set({ member: null });
    if (redirectToLogin) {
      const publicPaths = ['/login', '/signup', '/signup-complete'];
      const isPublicPage = publicPaths.some((path) => window.location.pathname.startsWith(path));
      if (!isPublicPage) {
        window.location.href = '/login';
      }
    }
  },
}));
