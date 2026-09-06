"use client";

import { useEffect, useState } from "react";
import { NotFoundView } from "@/components/NotFoundView";
import { PostDetail } from "@/components/PostDetail";
import { isPositiveIntId } from "@/lib/ids";
import { blogsService } from "@/services";
import styles from "@/app/board.module.css";

type Props =
  | { kind: "personal"; nickname: string; blogSlug: string; postId: string }
  | { kind: "team"; teamSlug: string; postId: string };

export function SharedPostPage(props: Props) {
  const [blogId, setBlogId] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const postIdValid = isPositiveIntId(props.postId);

  useEffect(() => {
    if (!postIdValid) {
      setLoading(false);
      setMissing(true);
      return;
    }

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
                slug: props.teamSlug,
              });
        if (!cancelled) setBlogId(blog.id);
      } catch {
        if (!cancelled) {
          setBlogId(null);
          setMissing(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [props, postIdValid]);

  if (!postIdValid || missing || (!loading && !blogId)) {
    return (
      <NotFoundView
        title="글을 찾을 수 없어요"
        description="주소가 잘못되었거나, 삭제된 글일 수 있습니다."
      />
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.state}>불러오는 중…</p>
      </div>
    );
  }

  return <PostDetail postId={props.postId} expectedBlogId={blogId!} />;
}
