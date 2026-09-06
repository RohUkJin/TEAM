"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment, Post } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { formatDateTime, getErrorMessage } from "@/lib/ui";
import { blogHref, postHref } from "@/lib/paths";
import { commentsService, postsService } from "@/services";
import { useAuthStore } from "@/stores";
import { ApiErrorView } from "@/components/ApiErrorView";
import { NotFoundView } from "@/components/NotFoundView";
import { PostMetaStats } from "@/components/PostMetaStats";
import { isPositiveIntId } from "@/lib/ids";
import styles from "@/app/post-detail.module.css";

type Props = { postId: string; expectedBlogId?: string };

export function PostDetail({ postId, expectedBlogId }: Props) {
  const router = useRouter();
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      await Promise.resolve();
      if (cancelled) return;
      if (!isPositiveIntId(postId)) {
        setPost(null);
        setLoadError(new ApiError(404, "NOT_FOUND", "Post not found"));
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const data = await postsService.getById(postId);
        if (cancelled) return;
        if (expectedBlogId && data.blogId !== expectedBlogId) {
          setPost(null);
          setLoadError(new ApiError(404, "NOT_FOUND", "Post not found"));
          return;
        }
        setPost(data);
      } catch (err) {
        if (cancelled) return;
        setPost(null);
        // 잘못된 id 형식(400)도 사용자에게는 404로 보여 준다
        if (
          err instanceof ApiError &&
          err.status === 400 &&
          /positive integer/i.test(err.message)
        ) {
          setLoadError(new ApiError(404, "NOT_FOUND", "Post not found"));
        } else {
          setLoadError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadComments() {
      await Promise.resolve();
      if (cancelled) return;
      if (!isPositiveIntId(postId)) {
        setComments([]);
        setCommentsLoading(false);
        return;
      }
      setCommentsLoading(true);
      setCommentsError(null);
      try {
        const list = await commentsService.listByPost(postId);
        if (cancelled) return;
        setComments(list);
      } catch (err) {
        if (cancelled) return;
        setComments([]);
        setCommentsError(getErrorMessage(err, "댓글을 불러오지 못했습니다"));
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }

    void loadPost();
    void loadComments();
    return () => {
      cancelled = true;
    };
  }, [postId, expectedBlogId]);

  const isPostOwner = Boolean(user && post && user.id === post.userId);
  const locked = Boolean(post?.locked);

  const blogPath =
    post &&
    blogHref({
      id: post.blogId,
      type: post.blogType ?? "personal",
      slug: post.blogSlug ?? "",
      ownerNickname: post.ownerNickname ?? null,
      ownerUrlSlug: post.ownerUrlSlug ?? null,
    });

  async function reloadComments() {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const list = await commentsService.listByPost(postId);
      setComments(list);
    } catch (err) {
      setComments([]);
      setCommentsError(getErrorMessage(err, "댓글을 불러오지 못했습니다"));
    } finally {
      setCommentsLoading(false);
    }
  }

  async function onDeletePost() {
    if (!confirm("이 글을 삭제할까요?")) return;
    setActionError(null);
    setDeletingPost(true);
    try {
      await postsService.remove(postId);
      router.push(blogPath || "/?tab=personal");
    } catch (err) {
      setActionError(getErrorMessage(err, "글을 삭제하지 못했습니다"));
    } finally {
      setDeletingPost(false);
    }
  }

  async function onSubmitComment(e: FormEvent) {
    e.preventDefault();
    setActionError(null);
    if (!commentText.trim()) {
      setActionError("댓글 내용을 입력해 주세요");
      return;
    }
    setSubmittingComment(true);
    try {
      await commentsService.create(postId, { content: commentText.trim() });
      setCommentText("");
      await reloadComments();
    } catch (err) {
      setActionError(getErrorMessage(err, "댓글을 작성하지 못했습니다"));
    } finally {
      setSubmittingComment(false);
    }
  }

  async function onDeleteComment(commentId: string) {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    setActionError(null);
    setDeletingCommentId(commentId);
    try {
      await commentsService.remove(commentId);
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingCommentText("");
      }
      await reloadComments();
    } catch (err) {
      setActionError(getErrorMessage(err, "댓글을 삭제하지 못했습니다"));
    } finally {
      setDeletingCommentId(null);
    }
  }

  function startEditComment(comment: Comment) {
    setActionError(null);
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  }

  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentText("");
  }

  async function onSaveComment(commentId: string) {
    const content = editingCommentText.trim();
    if (!content) {
      setActionError("댓글 내용을 입력해 주세요");
      return;
    }
    setActionError(null);
    setSavingCommentId(commentId);
    try {
      await commentsService.update(commentId, { content });
      setEditingCommentId(null);
      setEditingCommentText("");
      await reloadComments();
    } catch (err) {
      setActionError(getErrorMessage(err, "댓글을 수정하지 못했습니다"));
    } finally {
      setSavingCommentId(null);
    }
  }

  if (loading) {
    return (
      <article className={styles.articlePage}>
        <p className={styles.state}>글을 불러오는 중…</p>
      </article>
    );
  }

  if (loadError || !post) {
    if (loadError instanceof ApiError && loadError.isNotFound) {
      return (
        <NotFoundView
          title="글을 찾을 수 없어요"
          description="주소가 잘못되었거나, 삭제된 글일 수 있습니다."
        />
      );
    }
    if (loadError instanceof ApiError) {
      return <ApiErrorView error={loadError} fallback="글을 불러오지 못했습니다" />;
    }
    return (
      <NotFoundView
        title="글을 찾을 수 없어요"
        description="주소가 잘못되었거나, 삭제된 글일 수 있습니다."
      />
    );
  }

  const nextPath = postHref(post);
  const nextLogin = `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <article className={styles.articlePage}>
      <Link className={styles.back} href={blogPath || "/?tab=personal"}>
        ← 블로그로
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.metaRow}>
          <div className={styles.meta}>
            <PostMetaStats
              author={post.ownerNickname}
              dateLabel={formatDateTime(post.createdAt)}
              dateTime={post.createdAt}
              views={
                typeof post.viewCount === "number" ? post.viewCount : undefined
              }
            />
            {post.trendingVisible && !locked && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.badge}>트렌딩 표시</span>
              </>
            )}
          </div>
          {isPostOwner && !locked && (
            <div className={styles.ownerActions}>
              <Link
                className={styles.actionLink}
                href={`/posts/${post.id}/edit`}
              >
                수정
              </Link>
              <button
                type="button"
                className={`${styles.actionLink} ${styles.actionDanger}`}
                disabled={deletingPost}
                onClick={() => void onDeletePost()}
              >
                {deletingPost ? "삭제 중…" : "삭제"}
              </button>
            </div>
          )}
        </div>
      </header>

      {actionError && <p className={styles.error}>{actionError}</p>}

      <div className={locked ? styles.blurGate : undefined}>
        {locked && (
          <div className={styles.lockOverlay}>
            <div className={styles.lockCard}>
              <p className={styles.lockTitle}>멤버만 볼 수 있어요</p>
              <p className={styles.lockHint}>
                팀 글은 권한이 있어야 본문을 확인할 수 있습니다.
              </p>
              {authStatus !== "authenticated" ? (
                <Link className={styles.lockPrimary} href={nextLogin}>
                  로그인
                </Link>
              ) : (
                <Link
                  className={styles.lockPrimary}
                  href={blogPath || "/?tab=team"}
                >
                  팀 가입 신청하기
                </Link>
              )}
            </div>
          </div>
        )}

        <div className={locked ? styles.blurContent : undefined}>
          <div className={styles.body}>
            {locked
              ? "이 글의 내용은 팀 멤버만 볼 수 있습니다.\n멤버가 되면 전체 본문이 열려요."
              : post.content}
          </div>

          {!locked && (
            <section className={styles.comments} aria-labelledby="comments-heading">
              <h2 id="comments-heading" className={styles.commentsTitle}>
                댓글{" "}
                {!commentsLoading && (
                  <span className={styles.commentCount}>{comments.length}</span>
                )}
              </h2>

              {commentsError && <p className={styles.error}>{commentsError}</p>}
              {commentsLoading && (
                <p className={styles.state}>댓글 불러오는 중…</p>
              )}
              {!commentsLoading && !commentsError && comments.length === 0 && (
                <p className={styles.empty}>첫 댓글을 남겨 보세요.</p>
              )}

              {!commentsLoading && comments.length > 0 && (
                <ul className={styles.commentList}>
                  {comments.map((c) => {
                    const isMine = Boolean(user && user.id === c.userId);
                    const isEditing = editingCommentId === c.id;
                    const isBusy =
                      deletingCommentId === c.id || savingCommentId === c.id;
                    return (
                      <li key={c.id} className={styles.commentItem}>
                        <div className={styles.commentMeta}>
                          <span className={styles.commentAuthor}>
                            {c.nickname ?? "알 수 없음"}
                          </span>
                          <time dateTime={c.createdAt}>
                            {formatDateTime(c.createdAt)}
                          </time>
                          {isMine && !isEditing && (
                            <>
                              <button
                                type="button"
                                className={styles.actionLink}
                                disabled={isBusy}
                                onClick={() => startEditComment(c)}
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                className={`${styles.actionLink} ${styles.actionDanger}`}
                                disabled={isBusy}
                                onClick={() => void onDeleteComment(c.id)}
                              >
                                {deletingCommentId === c.id ? "…" : "삭제"}
                              </button>
                            </>
                          )}
                        </div>
                        {isEditing ? (
                          <div className={styles.commentEdit}>
                            <textarea
                              className={styles.commentInput}
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                              maxLength={5000}
                              aria-label="댓글 수정"
                            />
                            <div className={styles.commentEditActions}>
                              <button
                                type="button"
                                className={styles.actionLink}
                                disabled={isBusy}
                                onClick={cancelEditComment}
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                className={styles.commentSubmit}
                                disabled={isBusy}
                                onClick={() => void onSaveComment(c.id)}
                              >
                                {savingCommentId === c.id
                                  ? "저장 중…"
                                  : "저장"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.commentBody}>{c.content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {authStatus === "authenticated" ? (
                <form className={styles.commentForm} onSubmit={onSubmitComment}>
                  <label className={styles.commentLabel} htmlFor="comment-input">
                    댓글 작성
                    {user?.nickname ? (
                      <span className={styles.commentAs}>
                        {" "}
                        · {user.nickname}
                      </span>
                    ) : null}
                  </label>
                  <textarea
                    id="comment-input"
                    className={styles.commentInput}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={5000}
                    placeholder="생각을 남겨 주세요"
                  />
                  <div className={styles.commentActions}>
                    <button
                      className={styles.commentSubmit}
                      type="submit"
                      disabled={submittingComment}
                    >
                      {submittingComment ? "등록 중…" : "댓글 등록"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className={styles.loginHint}>
                  <Link href="/login">로그인</Link>
                  하면 댓글을 남길 수 있습니다.
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
