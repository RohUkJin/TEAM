"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { blogHref } from "@/lib/paths";
import { blogsService } from "@/services";
import styles from "@/app/board.module.css";

type Props = { blogId: string };

export function BlogIdRedirect({ blogId }: Props) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blog = await blogsService.getMeta(blogId);
        if (!cancelled) router.replace(blogHref(blog));
      } catch {
        if (!cancelled) router.replace("/?tab=team");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blogId, router]);

  return (
    <div className={styles.page}>
      <p className={styles.state}>이동 중…</p>
    </div>
  );
}
