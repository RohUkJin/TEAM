"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import styles from "@/app/auth.module.css";

export function AppHeader() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
    >
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand}>
          TEAM
        </Link>
        <nav className={styles.nav}>
          {status === "authenticated" && user ? (
            <button
              type="button"
              className={styles.navLinkButton}
              disabled={loggingOut}
              onClick={() => void onLogout()}
            >
              {loggingOut ? "로그아웃 중…" : "로그아웃"}
            </button>
          ) : (
            <Link href="/login" className={styles.navLink}>
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
