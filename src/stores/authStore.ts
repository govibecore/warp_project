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
  isGuest: boolean;  // true for users who skip login (old offline mode)

  // Actions
  setAuth(student: StudentProfile, tokens: Tokens): void;
  setAccessToken(token: string): void;
  clearAuth(): void;
  setGuest(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      student:         null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,
      isGuest:         false,

      setAuth: (student, tokens) => set({
        student,
        accessToken:     tokens.accessToken,
        refreshToken:    tokens.refreshToken,
        isAuthenticated: true,
        isGuest:         false,
      }),

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({
        student:         null,
        accessToken:     null,
        refreshToken:    null,
        isAuthenticated: false,
        isGuest:         false,
      }),

      setGuest: () => set({ isGuest: true, isAuthenticated: false }),
    }),
    {
      name:    'axiom.auth.v1',
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive fields; access token persisted for UX continuity
      // (short-lived 15min tokens are acceptable in localStorage for dev experience)
      partialize: (state) => ({
        student:         state.student,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isGuest:         state.isGuest,
      }),
    },
  ),
);
