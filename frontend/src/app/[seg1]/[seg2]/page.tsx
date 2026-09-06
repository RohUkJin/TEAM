import { Suspense } from "react";
import { SharedBlogPage } from "@/components/SharedBlogPage";
import { SharedPostPage } from "@/components/SharedPostPage";
import styles from "@/app/board.module.css";

type Props = { params: Promise<{ seg1: string; seg2: string }> };

export default async function Seg2Page({ params }: Props) {
  const { seg1, seg2 } = await params;
  const isPostId = /^\d+$/.test(seg2);

  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <p className={styles.state}>불러오는 중…</p>
        </div>
      }
    >
      {isPostId ? (
        <SharedPostPage kind="team" teamSlug={seg1} postId={seg2} />
      ) : (
        <SharedBlogPage kind="personal" nickname={seg1} blogSlug={seg2} />
      )}
    </Suspense>
  );
}
