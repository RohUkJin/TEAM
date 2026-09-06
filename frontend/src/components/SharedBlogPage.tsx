"use client";

import { useEffect, useState } from "react";
import { BlogDetail } from "@/components/BlogDetail";
import { NotFoundView } from "@/components/NotFoundView";
import { ApiError } from "@/lib/api";
import { blogsService } from "@/services";
import styles from "@/app/board.module.css";

type Props =
  | { kind: "personal"; nickname: string; blogSlug: string }
  | { kind: "team"; slug: string };

export function SharedBlogPage(props: Props) {
  const [blogId, setBlogId] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMissing(false);
      try {
        const blog =
          props.kind === "personal"
            ? await blogsService.resolve({
                kind: "personal",
                urlSlug: props.nickname,
                slug: props.blogSlug,
              })
            : await blogsService.resolve({
                kind: "team",
                slug: props.slug,
              });
        if (!cancelled) setBlogId(blog.id);
      } catch (err) {
        if (!cancelled) {
          setBlogId(null);
          setMissing(true);
          if (!(err instanceof ApiError && err.isNotFound)) {
            // 네트워크 등도 동일하게 안내 — URL 기준으로는 찾을 수 없음
            setMissing(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    props.kind,
    props.kind === "personal" ? props.nickname : props.slug,
    props.kind === "personal" ? props.blogSlug : "",
  ]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.state}>불러오는 중…</p>
      </div>
    );
  }

  if (missing || !blogId) {
    return (
      <NotFoundView
        title="블로그를 찾을 수 없어요"
        description="주소가 잘못되었거나, 삭제·비공개된 블로그일 수 있습니다."
      />
    );
  }

  return <BlogDetail blogId={blogId} />;
}
