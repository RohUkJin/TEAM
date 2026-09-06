import { create } from "zustand";
import { ApiError, type User } from "@/lib/api";
import { authService, type LoginInput } from "@/services";

/**
 * Global auth client state (Zustand).
 * - loading: 세션 확인 중 (GET /auth/me)
 * - authenticated: user 존재
 * - unauthenticated: 비로그인
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  initialize: () => Promise<void>;
  setAuthenticated: (user: User) => void;
  setUnauthenticated: () => void;
  login: (input: LoginInput) => Promise<User>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

/** React Strict Mode 이중 mount에서도 /auth/me는 한 번만 호출 */
let bootstrapPromise: Promise<void> | null = null;

export function resetAuthBootstrap() {
  bootstrapPromise = null;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,

  setAuthenticated: (user) => {
    set({ status: "authenticated", user });
  },

  setUnauthenticated: () => {
    set({ status: "unauthenticated", user: null });
  },

  clearSession: () => {
    resetAuthBootstrap();
    set({ status: "unauthenticated", user: null });
  },

  initialize: () => {
    if (bootstrapPromise) {
      return bootstrapPromise;
    }

    bootstrapPromise = (async () => {
      set({ status: "loading", user: null });
      try {
        const { user } = await authService.me();
        set({ status: "authenticated", user });
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          try {
            const refreshed = await authService.refresh();
            set({ status: "authenticated", user: refreshed.user });
            return;
          } catch {
            set({ status: "unauthenticated", user: null });
            return;
          }
        }
        set({ status: "unauthenticated", user: null });
      }
    })();

    return bootstrapPromise;
  },

  login: async (input) => {
    const { user } = await authService.login(input);
    set({ status: "authenticated", user });
    return user;
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      /* 쿠키 만료 등과 무관하게 클라이언트 세션은 비운다 */
    }
    resetAuthBootstrap();
    set({ status: "unauthenticated", user: null });
  },
}));
