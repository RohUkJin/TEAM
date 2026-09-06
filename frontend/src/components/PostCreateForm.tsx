"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/ui";
import { postsService } from "@/services";
import styles from "@/app/board.module.css";

/**
 * RequireAuth 하에서만 렌더된다.
 * 제출 권한은 Backend POST /api/posts 가 최종 판정한다.
 */
export function PostCreateForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [trendingVisible, setTrendingVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해 주세요");
      return;
    }

    setSubmitting(true);
    try {
      const post = await postsService.create({
        title: title.trim(),
        content: content.trim(),
        trendingVisible,
      });
      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "글을 저장하지 못했습니다"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>새 글 작성</h1>
      <p className={styles.hint}>자유롭게 생각을 적어 보세요.</p>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          제목
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="제목을 입력하세요"
          />
        </label>
        <label className={styles.label}>
          내용
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={20000}
            placeholder="내용을 입력하세요"
          />
        </label>
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
        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={submitting}>
            {submitting ? "저장 중…" : "출간하기"}
          </button>
          <Link className={styles.buttonSecondary} href="/?tab=personal">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
