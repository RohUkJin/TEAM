"use client";

import { useEffect } from "react";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { useAuthStore } from "@/stores";

function safeNextPath(pathname: string, search: string): string {
  const raw = `${pathname}${search}`;
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

/**
 * 앱 마운트 시:
 * 1) /auth/me 로 세션 복구
 * 2) API Client 401 핸들러 등록 (auth 초기화 + 로그인 이동)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      if (typeof window === "undefined") return;
      // 이미 로그인 페이지면 루프 방지
      if (window.location.pathname.startsWith("/login")) return;
      const next = encodeURIComponent(
        safeNextPath(window.location.pathname, window.location.search),
      );
      window.location.assign(`/login?next=${next}`);
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  return children;
}
