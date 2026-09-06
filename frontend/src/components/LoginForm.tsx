"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, getUserFacingMessage } from "@/lib/api";
import {
  hasFieldErrors,
  validateLoginInput,
  type FieldErrors,
} from "@/lib/authValidation";
import { useAuthStore } from "@/stores";
import styles from "@/app/auth.module.css";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/posts";
  // open-redirect 방지: 상대 경로만 허용
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/posts";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    const errors = validateLoginInput({ email, password });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.push(nextPath);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(getUserFacingMessage(err));
      } else {
        setApiError("로그인에 실패했습니다");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.authPanel}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.hint}>계정으로 로그인하고 글을 작성해 보세요.</p>

        {status === "authenticated" && user && (
          <p className={styles.bannerOk}>
            이미 {user.email} 계정으로 로그인되어 있습니다.
          </p>
        )}

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {apiError && <p className={styles.bannerError}>{apiError}</p>}

          <label className={styles.label}>
            이메일
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <span className={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </label>

          <label className={styles.label}>
            비밀번호
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && (
              <span className={styles.fieldError}>{fieldErrors.password}</span>
            )}
          </label>

          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "로그인 중…" : "로그인"}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <Link href="/register">계정이 없나요? 회원가입</Link>
          <Link href="/verify-email">이메일 인증하기</Link>
        </div>
      </div>
    </div>
  );
}
