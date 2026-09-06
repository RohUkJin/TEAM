import { Suspense } from "react";
import { HomeFeed } from "@/components/HomeFeed";
import styles from "@/app/page.module.css";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className={styles.feedShell}>
          <p className={styles.state}>불러오는 중…</p>
        </main>
      }
    >
      <HomeFeed />
    </Suspense>
  );
}
