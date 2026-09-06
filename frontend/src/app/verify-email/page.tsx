import { Suspense } from "react";
import { VerifyEmailPanel } from "@/components/VerifyEmailPanel";
import styles from "@/app/auth.module.css";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.main}>
          <div className={styles.authPanel}>
            <p className={styles.hint}>불러오는 중…</p>
          </div>
        </div>
      }
    >
      <VerifyEmailPanel />
    </Suspense>
  );
}
