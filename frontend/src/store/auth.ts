import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie, removeCookie } from "@/lib/cookies";

interface User {
  id: string;
  phone: string;
  full_name: string;
  avatar: string | null;
  role: string;
  status: string;
  lang: string;
  is_phone_verified: boolean;
  bio?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => {
        setCookie("access_token", accessToken);
        setCookie("refresh_token", refreshToken);
        set({ accessToken, refreshToken });
      },
      logout: () => {
        removeCookie("access_token");
        removeCookie("refresh_token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "ustago-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
