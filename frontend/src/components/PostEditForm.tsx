"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Blog, Post } from "@/lib/api";
import { getErrorMessage } from "@/lib/ui";
import { blogsService, postsService } from "@/services";
import { useAuthStore } from "@/stores";
import styles from "@/app/board.module.css";

type Props = { postId: string };

export function PostEditForm({ postId }: Props) {
  const router = useRouter();
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const [post, setPost] = useState<Post | null>(null);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [trendingVisible, setTrendingVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await postsService.getById(postId);
        if (cancelled) return;
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setTrendingVisible(Boolean(data.trendingVisible));
        try {
          const meta = await blogsService.getMeta(data.blogId);
          if (!cancelled) setBlog(meta);
        } catch {
          /* meta optional for checkbox */
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "글을 불러오지 못했습니다"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const isPersonal = blog?.type === "personal";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해 주세요");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await postsService.update(postId, {
        title: title.trim(),
        content: content.trim(),
        trendingVisible: isPersonal ? trendingVisible : false,
      });
      router.push(`/posts/${updated.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "글을 수정하지 못했습니다"));
    } finally {
      setSubmitting(false);
    }
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className={styles.page}>
        <p className={styles.state}>불러오는 중…</p>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error}</p>
        <Link className={styles.link} href="/?tab=personal">
          목록으로
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(user && post && user.id === post.userId);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>글 수정</h1>
      <p className={styles.hint}>내용을 다듬고 다시 저장하세요.</p>

      {!isOwner && (
        <p className={styles.error}>
          작성자가 아닌 것 같습니다. 저장 시 서버에서 거절될 수 있습니다.
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          제목
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </label>
        <label className={styles.label}>
          내용
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={20000}
          />
        </label>
        {isPersonal && (
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={trendingVisible}
              onChange={(e) => setTrendingVisible(e.target.checked)}
            />
            <span>
              <strong>트렌딩에 노출</strong>
              <em>체크하면 홈 인기 글에 포함될 수 있습니다.</em>
            </span>
          </label>
        )}
        <div className={styles.actions}>
          {isOwner && (
            <button className={styles.button} type="submit" disabled={submitting}>
              {submitting ? "저장 중…" : "저장하기"}
            </button>
          )}
          <Link className={styles.buttonSecondary} href={`/posts/${postId}`}>
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
