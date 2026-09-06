"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authService } from "@/services";
import { SignupSteps } from "@/components/SignupSteps";
import styles from "@/app/auth.module.css";

type VerifyView =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "success";
      email: string;
      alreadyVerified: boolean;
    }
  | { kind: "error"; message: string };

const LOGIN_REDIRECT_MS = 1500;

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") ?? "";
  const emailFromQuery = searchParams.get("email") ?? "";
  const fromRegister = searchParams.get("from") === "register";

  const [draft, setDraft] = useState<string | null>(null);
  const token = draft ?? tokenFromQuery;
  const [view, setView] = useState<VerifyView>({ kind: "idle" });

  async function verify(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setView({ kind: "error", message: "인증 토큰을 입력해 주세요" });
      return;
    }

    setView({ kind: "loading" });
    try {
      const result = await authService.verifyEmail(trimmed);
      setView({
        kind: "success",
        email: result.user.email,
        alreadyVerified: result.alreadyVerified,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setView({ kind: "error", message: err.message });
      } else {
        setView({ kind: "error", message: "인증에 실패했습니다" });
      }
    }
  }

  useEffect(() => {
    if (!tokenFromQuery) return;
    let cancelled = false;

    async function run() {
      await Promise.resolve();
      if (cancelled) return;
      setView({ kind: "loading" });
      try {
        const result = await authService.verifyEmail(tokenFromQuery.trim());
        if (cancelled) return;
        setView({
          kind: "success",
          email: result.user.email,
          alreadyVerified: result.alreadyVerified,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError) {
          setView({ kind: "error", message: err.message });
        } else {
          setView({ kind: "error", message: "인증에 실패했습니다" });
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [tokenFromQuery]);

  useEffect(() => {
    if (view.kind !== "success") return;
    const timer = window.setTimeout(() => {
      router.replace("/login");
    }, LOGIN_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [view, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await verify(token);
  }

  return (
    <div className={styles.main}>
      <div className={styles.authPanel}>
        <SignupSteps step={2} />
        <h1 className={styles.title}>이메일 인증</h1>
        <p className={styles.hint}>
          {fromRegister && emailFromQuery
            ? `${emailFromQuery} 계정 생성이 완료되었습니다. 받은 메일함의 인증 링크로 가입을 마무리해 주세요.`
            : "가입 시 받은 인증 링크로 이메일을 확인해 주세요."}
        </p>

        {fromRegister && !tokenFromQuery && (
          <p className={styles.bannerOk}>
            인증 메일을 보냈습니다. 메일 속 링크를 열거나, 토큰을 아래에 입력해 주세요.
          </p>
        )}

        {view.kind === "loading" && (
          <p className={styles.hint}>인증을 확인하는 중…</p>
        )}

        {view.kind === "success" && (
          <div className={styles.bannerOk}>
            <p className={styles.redirectMessage}>
              {view.alreadyVerified
                ? `이미 인증된 계정입니다: ${view.email}`
                : `${view.email} 인증이 완료되었습니다.`}
            </p>
            <p className={styles.redirectHint}>
              잠시 후 로그인 페이지로 이동합니다
              <span className={styles.redirectDots} aria-hidden>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
            <div
              className={styles.redirectTrack}
              role="progressbar"
              aria-label="로그인 페이지로 이동 중"
            >
              <div
                className={styles.redirectBar}
                style={{
                  animationDuration: `${LOGIN_REDIRECT_MS}ms`,
                }}
              />
            </div>
          </div>
        )}

        {view.kind === "error" && (
          <p className={styles.bannerError}>{view.message}</p>
        )}

        {view.kind !== "success" && (
          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label}>
              인증 토큰
              <input
                className={styles.input}
                value={token}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="토큰을 붙여넣으세요"
              />
            </label>
            <button
              className={styles.button}
              type="submit"
              disabled={view.kind === "loading"}
            >
              인증하기
            </button>
          </form>
        )}

        <div className={styles.footerLinks}>
          {view.kind === "success" ? (
            <Link href="/login">바로 로그인으로 이동</Link>
          ) : (
            <>
              <Link href="/login">로그인으로 이동</Link>
              <Link href="/register">회원가입 1단계로</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
