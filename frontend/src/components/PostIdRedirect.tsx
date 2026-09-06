"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NotFoundView } from "@/components/NotFoundView";
import { isPositiveIntId } from "@/lib/ids";
import { postHref } from "@/lib/paths";
import { postsService } from "@/services";
import styles from "@/app/board.module.css";

type Props = { postId: string };

export function PostIdRedirect({ postId }: Props) {
  const router = useRouter();
  const [missing, setMissing] = useState(!isPositiveIntId(postId));

  useEffect(() => {
    if (!isPositiveIntId(postId)) {
      setMissing(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const post = await postsService.getById(postId);
        if (!cancelled) router.replace(postHref(post));
      } catch {
        if (!cancelled) setMissing(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId, router]);

  if (missing) {
    return (
      <NotFoundView
        title="글을 찾을 수 없어요"
        description="주소가 잘못되었거나, 삭제된 글일 수 있습니다."
      />
    );
  }

  return (
    <div className={styles.page}>
      <p className={styles.state}>이동 중…</p>
    </div>
  );
}
