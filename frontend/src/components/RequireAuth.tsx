"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import styles from "@/app/board.module.css";

type Props = {
  children: React.ReactNode;
};

/**
 * Frontend Route Guard (UX only).
 * - loading: /auth/me 완료 전 대기
 * - unauthenticated: /login 으로 이동 (?next=현재 경로)
 * - authenticated: children 렌더
 *
 * 실제 보안(인가)은 Backend API가 수행한다.
 */
export function RequireAuth({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const next = encodeURIComponent(pathname || "/");
    router.replace(`/login?next=${next}`);
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <p className={styles.state}>로그인 상태 확인 중…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className={styles.page}>
        <p className={styles.state}>로그인 페이지로 이동 중…</p>
      </div>
    );
  }

  return children;
}
