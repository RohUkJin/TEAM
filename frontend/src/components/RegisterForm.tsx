"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getUserFacingMessage } from "@/lib/api";
import {
  EMAIL_REGEX,
  hasFieldErrors,
  previewUrlSlug,
  validateRegisterInput,
  type FieldErrors,
} from "@/lib/authValidation";
import { authService } from "@/services";
import { SignupSteps } from "@/components/SignupSteps";
import styles from "@/app/auth.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailTrimmed = email.trim();
  const nicknameTrimmed = nickname.trim();
  const hasEmptyField =
    !nicknameTrimmed || !emailTrimmed || !password || !passwordConfirm;
  const emailInvalid =
    Boolean(emailTrimmed) && !EMAIL_REGEX.test(emailTrimmed);
  const passwordMismatch =
    Boolean(passwordConfirm) && password !== passwordConfirm;

  const canSubmit =
    !submitting && !hasEmptyField && !emailInvalid && !passwordMismatch;

  const slugPreview = previewUrlSlug(nickname, urlSlug);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setApiError(null);

    const errors = validateRegisterInput({
      email,
      password,
      passwordConfirm,
      nickname,
      urlSlug,
    });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    setSubmitting(true);
    try {
      const slug = urlSlug.trim().toLowerCase();
      const result = await authService.register({
        email: email.trim(),
        password,
        nickname: nickname.trim().normalize("NFC").toLowerCase(),
        ...(slug ? { urlSlug: slug } : {}),
      });

      const params = new URLSearchParams({
        email: result.user.email,
        from: "register",
      });
      if (result.devVerificationToken) {
        params.set("token", result.devVerificationToken);
      }
      router.push(`/verify-email?${params.toString()}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(getUserFacingMessage(err));
      } else {
        setApiError("회원가입에 실패했습니다");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.authPanel}>
        <SignupSteps step={1} />
        <h1 className={styles.title}>회원가입</h1>
        <p className={styles.hint}>
          닉네임은 표시용이고, 블로그 주소(영문)는 선택입니다.
        </p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {apiError && <p className={styles.bannerError}>{apiError}</p>}

          <label className={styles.label}>
            닉네임
            <input
              className={styles.input}
              type="text"
              autoComplete="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="홍길동"
            />
            {fieldErrors.nickname && (
              <span className={styles.fieldError}>{fieldErrors.nickname}</span>
            )}
          </label>

          <label className={styles.label}>
            블로그 주소 ID (선택)
            <input
              className={styles.input}
              type="text"
              autoComplete="username"
              value={urlSlug}
              onChange={(e) => {
                const next = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "");
                setUrlSlug(next);
              }}
              onBeforeInput={(e) => {
                const data = (e as unknown as InputEvent).data;
                if (data && /[^a-zA-Z0-9]/.test(data)) {
                  e.preventDefault();
                }
              }}
              placeholder="예: gildong"
              inputMode="text"
              spellCheck={false}
              lang="en"
            />
            {fieldErrors.urlSlug && (
              <span className={styles.fieldError}>{fieldErrors.urlSlug}</span>
            )}
            {!fieldErrors.urlSlug && (
              <span className={styles.hintInline}>
                {urlSlug.trim() ||
                (nicknameTrimmed && slugPreview !== "user…") ? (
                  <>내 주소: /{slugPreview}/blog</>
                ) : (
                  <>
                    영문, 숫자만 가능합니다.
                    <br />
                    · gildong → /gildong/blog · 미입력 시 숫자로 자동 발급
                  </>
                )}
              </span>
            )}
          </label>

          <label className={styles.label}>
            이메일
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gildong@gmail.com"
            />
            {emailInvalid && (
              <span className={styles.fieldError}>
                이메일 형식이 올바르지 않습니다
              </span>
            )}
            {fieldErrors.email && !emailInvalid && (
              <span className={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </label>

          <label className={styles.label}>
            비밀번호
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상, 영문, 숫자 조합"
            />
            {fieldErrors.password && (
              <span className={styles.fieldError}>{fieldErrors.password}</span>
            )}
            {!fieldErrors.password && (
              <span className={styles.hintInline}>
                8자 이상, 영문과 숫자를 각각 1자 이상 포함
              </span>
            )}
          </label>

          <label className={styles.label}>
            비밀번호 확인
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력"
            />
            {passwordMismatch && (
              <span className={styles.fieldError}>
                비밀번호가 일치하지 않습니다
              </span>
            )}
            {fieldErrors.passwordConfirm && !passwordMismatch && (
              <span className={styles.fieldError}>
                {fieldErrors.passwordConfirm}
              </span>
            )}
          </label>

          <button className={styles.button} type="submit" disabled={!canSubmit}>
            {submitting ? "가입 중…" : "다음 · 이메일 인증"}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <Link href="/login">이미 계정이 있나요? 로그인</Link>
        </div>
      </div>
    </div>
  );
}
