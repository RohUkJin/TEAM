import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SharedPostPage } from "@/components/SharedPostPage";
import { isPositiveIntId } from "@/lib/ids";
import styles from "@/app/board.module.css";

type Props = {
  params: Promise<{ seg1: string; seg2: string; seg3: string }>;
};

export default async function Seg3Page({ params }: Props) {
  const { seg1, seg2, seg3 } = await params;
  if (!isPositiveIntId(seg3)) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <p className={styles.state}>불러오는 중…</p>
        </div>
      }
    >
      <SharedPostPage
        kind="personal"
        nickname={seg1}
        blogSlug={seg2}
        postId={seg3}
      />
    </Suspense>
  );
}
