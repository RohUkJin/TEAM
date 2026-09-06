"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Blog } from "@/lib/api";
import { getErrorMessage } from "@/lib/ui";
import { blogsService } from "@/services";
import styles from "@/app/board.module.css";

type Props = { blogId: string };

export function BlogPostCreateForm({ blogId }: Props) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [trendingVisible, setTrendingVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const meta = await blogsService.getMeta(blogId);
        if (!cancelled) setBlog(meta);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "블로그를 불러오지 못했습니다"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [blogId]);

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
      const post = await blogsService.createPost(blogId, {
        title: title.trim(),
        content: content.trim(),
        trendingVisible: isPersonal ? trendingVisible : false,
      });
      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "글을 저장하지 못했습니다"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.state}>불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>새 글 작성</h1>
      <p className={styles.hint}>
        {isPersonal
          ? "내 개인 블로그에 글을 작성합니다."
          : "이 팀 블로그에 글을 작성합니다."}
      </p>

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
          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "저장 중…" : "출간하기"}
          </button>
          <Link className={styles.buttonSecondary} href={`/blogs/${blogId}`}>
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
