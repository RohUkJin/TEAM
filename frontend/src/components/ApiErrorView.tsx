"use client";

import Link from "next/link";
import { ApiError } from "@/lib/api";
import { getErrorMessage, getErrorTitle } from "@/lib/ui";
import { NotFoundView } from "@/components/NotFoundView";
import styles from "@/app/board.module.css";

type Props = {
  error: unknown;
  fallback?: string;
  homeHref?: string;
};

/**
 * 403 / 404 / 500 등 공통 에러 UI.
 * 404는 NotFoundView로 통일한다.
 */
export function ApiErrorView({
  error,
  fallback = "문제가 발생했습니다",
  homeHref = "/",
}: Props) {
  if (error instanceof ApiError && error.isNotFound) {
    return (
      <NotFoundView
        title="페이지를 찾을 수 없어요"
        description="주소가 잘못되었거나, 삭제·이동된 페이지일 수 있습니다."
        homeHref={homeHref}
      />
    );
  }

  const title = getErrorTitle(error);
  const message = getErrorMessage(error, fallback);
  const status = error instanceof ApiError ? error.status : undefined;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      {status !== undefined && (
        <p className={styles.meta}>오류 코드 {status}</p>
      )}
      <p className={styles.error}>{message}</p>
      <div className={styles.actions}>
        <Link className={styles.buttonSecondary} href={homeHref}>
          돌아가기
        </Link>
        {error instanceof ApiError && error.isUnauthorized && (
          <Link className={styles.button} href="/login">
            로그인
          </Link>
        )}
      </div>
    </div>
  );
}
