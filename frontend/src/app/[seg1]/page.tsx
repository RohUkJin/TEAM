import { Suspense } from "react";
import { SharedBlogPage } from "@/components/SharedBlogPage";
import styles from "@/app/board.module.css";

type Props = { params: Promise<{ seg1: string }> };

export default async function Seg1Page({ params }: Props) {
  const { seg1 } = await params;
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <p className={styles.state}>불러오는 중…</p>
        </div>
      }
    >
      <SharedBlogPage kind="team" slug={seg1} />
    </Suspense>
  );
}
