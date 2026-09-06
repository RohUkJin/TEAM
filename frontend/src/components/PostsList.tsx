"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Pagination, Post } from "@/lib/api";
import { excerpt, formatDate, getErrorMessage } from "@/lib/ui";
import { postsService } from "@/services";
import { useAuthStore } from "@/stores";
import styles from "@/app/board.module.css";

const PAGE_LIMIT = 5;

export function PostsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const authStatus = useAuthStore((s) => s.status);

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setError(null);
      try {
        const result = await postsService.list({ page, limit: PAGE_LIMIT });
        if (cancelled) return;
        setPosts(result.posts);
        setPagination(result.pagination);
      } catch (err) {
        if (cancelled) return;
        setPosts([]);
        setPagination(null);
        setError(getErrorMessage(err, "글을 불러오지 못했습니다"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  function goPage(next: number) {
    router.push(`/posts?page=${next}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>글 목록</h1>
        {authStatus === "authenticated" ? (
          <Link className={styles.button} href="/posts/write">
            새 글 작성
          </Link>
        ) : (
          <Link className={styles.link} href="/login">
            로그인하고 글쓰기
          </Link>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.state}>불러오는 중…</p>}

      {!loading && !error && posts.length === 0 && (
        <p className={styles.empty}>아직 작성된 글이 없습니다.</p>
      )}

      {!loading && posts.length > 0 && (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.id} className={styles.listItem}>
              <Link href={`/posts/${post.id}`}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.excerpt}>{excerpt(post.content)}</p>
                <p className={styles.meta}>{formatDate(post.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pagination && pagination.total > 0 && (
        <div className={styles.pagination}>
          <button
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={() => goPage(pagination.page - 1)}
          >
            이전
          </button>
          <span>
            {pagination.page} / {Math.max(pagination.totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={
              loading || pagination.page >= Math.max(pagination.totalPages, 1)
            }
            onClick={() => goPage(pagination.page + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
