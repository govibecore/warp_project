import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  currentClass: number;
  schoolName?: string;
  city?: string;
  state?: string;
  parentName?: string;
  parentEmail?: string;
  whatsappNumber?: string;
  difficultyPreference: 'standard' | 'advanced' | 'olympiad';
  createdAt: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  student: StudentProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth(student: StudentProfile, tokens: Tokens): void;
  setAccessToken(token: string): void;
  clearAuth(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      student:         null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      setAuth: (student, tokens) => set({
        student,
        accessToken:     tokens.accessToken,
        refreshToken:    tokens.refreshToken,
        isAuthenticated: true,
      }),

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({
        student:         null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
      }),
    }),
    {
      name:    'warp.auth.v1',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive fields; access token persisted for UX continuity
      // (short-lived 15min tokens are acceptable in localStorage for dev experience)
      partialize: (state) => ({
        student:         state.student,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
