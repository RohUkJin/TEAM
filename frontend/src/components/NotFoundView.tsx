"use client";

import Link from "next/link";
import styles from "./NotFoundView.module.css";

type Props = {
  title?: string;
  description?: string;
  homeHref?: string;
};

export function NotFoundView({
  title = "페이지를 찾을 수 없어요",
  description = "주소가 잘못되었거나, 삭제·이동된 페이지일 수 있습니다.",
  homeHref = "/",
}: Props) {
  return (
    <main className={styles.wrap} aria-labelledby="not-found-title">
      <div className={styles.glow} aria-hidden />
      <div className={styles.panel}>
        <p className={styles.code} aria-hidden>
          404
        </p>
        <h1 id="not-found-title" className={styles.title}>
          {title}
        </h1>
        <p className={styles.desc}>{description}</p>
        <div className={styles.actions}>
          <Link href={homeHref} className={styles.primary}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
