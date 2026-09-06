"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Blog, Pagination, Post } from "@/lib/api";
import { excerpt, formatDate, formatDateTime, getErrorMessage } from "@/lib/ui";
import { blogHref, blogWriteHref, postHref } from "@/lib/paths";
import { blogsService } from "@/services";
import { useAuthStore } from "@/stores";
import { NotFoundView } from "@/components/NotFoundView";
import styles from "@/app/board.module.css";

type Props = { blogId: string };

const PAGE_LIMIT = 5;

export function BlogDetail({ blogId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const [meta, setMeta] = useState<Blog | null>(null);
  const [locked, setLocked] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savingDescription, setSavingDescription] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [postView, setPostView] = useState<"list" | "thumb">("list");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setError(null);
      try {
        const blogMeta = await blogsService.getMeta(blogId);
        if (cancelled) return;
        setMeta(blogMeta);

        const isLocked = blogMeta.type === "team" && !blogMeta.isMember;
        setLocked(isLocked);

        const result = await blogsService.listPosts(blogId, {
          page,
          limit: PAGE_LIMIT,
        });
        if (cancelled) return;
        setPosts(result.posts);
        setPagination(result.pagination);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, "블로그를 불러오지 못했습니다"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [blogId, page, authStatus]);

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    setJoinError(null);
    if (!meta) return;
    const next = blogHref(meta);
    if (authStatus !== "authenticated") {
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!inviteCode.trim()) {
      setJoinError("초대코드를 입력해 주세요");
      return;
    }
    setJoining(true);
    try {
      const blog = await blogsService.join(blogId, inviteCode.trim());
      setMeta(blog);
      setLocked(false);
      setInviteCode("");
      setJoinError(null);
      const result = await blogsService.listPosts(blogId, {
        page: 1,
        limit: PAGE_LIMIT,
      });
      setPosts(result.posts);
      setPagination(result.pagination);
      router.replace(blogHref(blog));
    } catch (err) {
      setJoinError(getErrorMessage(err, "가입에 실패했습니다"));
    } finally {
      setJoining(false);
    }
  }

  async function onCreateInvite() {
    setError(null);
    setInviteBusy(true);
    setGeneratedCode(null);
    setInviteExpiresAt(null);
    setCopiedInvite(false);
    try {
      const result = await blogsService.createInvite(blogId);
      setGeneratedCode(result.code);
      setInviteExpiresAt(result.expiresAt);
    } catch (err) {
      setError(getErrorMessage(err, "초대코드를 만들지 못했습니다"));
    } finally {
      setInviteBusy(false);
    }
  }

  function closeInviteModal() {
    setGeneratedCode(null);
    setInviteExpiresAt(null);
    setCopiedInvite(false);
  }

  async function onCopyInviteCode() {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1600);
    } catch {
      setError("초대코드를 복사하지 못했습니다");
    }
  }

  function startEditName() {
    if (!meta) return;
    setNameDraft(meta.name);
    setEditingName(true);
    setEditingDescription(false);
    setError(null);
  }

  async function onSaveName(e: FormEvent) {
    e.preventDefault();
    if (!meta) return;
    const next = nameDraft.trim();
    if (!next) {
      setError("팀 이름을 입력해 주세요");
      return;
    }
    setSavingName(true);
    setError(null);
    try {
      const updated = await blogsService.updateName(blogId, next);
      setMeta(updated);
      setEditingName(false);
    } catch (err) {
      setError(getErrorMessage(err, "팀 이름을 수정하지 못했습니다"));
    } finally {
      setSavingName(false);
    }
  }

  function startEditDescription() {
    if (!meta) return;
    setDescriptionDraft(meta.description ?? "");
    setEditingDescription(true);
    setEditingName(false);
    setError(null);
  }

  async function onSaveDescription(e: FormEvent) {
    e.preventDefault();
    if (!meta) return;
    const next = descriptionDraft.trim();
    if (!next) {
      setError("팀 소개를 입력해 주세요");
      return;
    }
    setSavingDescription(true);
    setError(null);
    try {
      const updated = await blogsService.updateDescription(blogId, next);
      setMeta(updated);
      setEditingDescription(false);
    } catch (err) {
      setError(getErrorMessage(err, "팀 소개를 수정하지 못했습니다"));
    } finally {
      setSavingDescription(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.state}>불러오는 중…</p>
      </div>
    );
  }

  if (!meta) {
    return (
      <NotFoundView
        title="블로그를 찾을 수 없어요"
        description="주소가 잘못되었거나, 삭제·비공개된 블로그일 수 있습니다."
      />
    );
  }

  const isOwner = Boolean(user && meta.role === "owner");
  const path = blogHref(meta);
  const nextLogin = `/login?next=${encodeURIComponent(path)}`;

  return (
    <div className={styles.page}>
      <Link
        className={styles.backRow}
        href={meta.type === "team" ? "/?tab=team" : "/?tab=personal"}
      >
        ← 블로그 목록
      </Link>

      <div className={styles.titleRow}>
        <h1 className={styles.detailTitle}>{meta.name}</h1>
        {meta.isMember && (
          <Link className={styles.button} href={blogWriteHref(meta)}>
            새 글 작성
          </Link>
        )}
      </div>

      <div className={styles.metaRow}>
        <p className={styles.meta}>
          {meta.type === "team" ? "팀 블로그" : "개인 블로그"}
          {meta.type === "team" && (
            <>
              {" · "}
              멤버 {meta.memberCount ?? 0}
            </>
          )}
          {meta.isMember ? " · 참여 중" : ""}
          {" · "}
          개설 {formatDate(meta.createdAt)}
        </p>
        {isOwner &&
          meta.type === "team" &&
          !editingDescription &&
          !editingName && (
          <div className={styles.metaActions}>
            <button
              type="button"
              className={styles.textAction}
              onClick={startEditName}
            >
              이름 변경
            </button>
            <button
              type="button"
              className={styles.textAction}
              onClick={startEditDescription}
            >
              소개 수정
            </button>
            <button
              type="button"
              className={styles.textAction}
              disabled={inviteBusy}
              onClick={() => void onCreateInvite()}
            >
              {inviteBusy ? "발급 중…" : "초대코드 발급"}
            </button>
          </div>
        )}
      </div>

      {meta.type === "team" && editingName && (
        <form className={styles.descriptionEdit} onSubmit={onSaveName}>
          <label className={styles.label}>
            팀 이름
            <input
              className={styles.input}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              maxLength={100}
            />
          </label>
          <div className={styles.actions}>
            <button
              className={styles.button}
              type="submit"
              disabled={savingName}
            >
              {savingName ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              disabled={savingName}
              onClick={() => setEditingName(false)}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {meta.type === "team" && !editingDescription && (
        <div className={styles.blogDescriptionBox}>
          {meta.description ? (
            <p className={styles.blogDescription}>{meta.description}</p>
          ) : (
            <p className={styles.blogDescriptionEmpty}>아직 팀 소개가 없습니다.</p>
          )}
        </div>
      )}

      {meta.type === "team" && editingDescription && (
        <form className={styles.descriptionEdit} onSubmit={onSaveDescription}>
          <label className={styles.label}>
            팀 소개
            <textarea
              className={`${styles.textarea} ${styles.textareaCompact}`}
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              maxLength={1000}
            />
          </label>
          <div className={styles.actions}>
            <button
              className={styles.button}
              type="submit"
              disabled={savingDescription}
            >
              {savingDescription ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              disabled={savingDescription}
              onClick={() => setEditingDescription(false)}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {generatedCode && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          onClick={closeInviteModal}
        >
          <div
            className={styles.lockCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="invite-modal-title" className={styles.lockTitle}>
              초대코드가 발급됐어요
            </h2>
            <p className={styles.lockHint}>
              이 코드는 24시간 동안만 유효하며, 1회 사용 시 즉시 폐기됩니다. 2명을 초대하려면 코드를 2번 발급해야 합니다.
            </p>
            <div className={styles.inviteCodeBox}>
              <span className={styles.inviteCodeLabel}>초대코드</span>
              <div className={styles.inviteCodeRow}>
                <code className={styles.inviteCodeValue}>{generatedCode}</code>
                <button
                  type="button"
                  className={styles.inviteCopyBtn}
                  onClick={() => void onCopyInviteCode()}
                  aria-label={copiedInvite ? "복사됨" : "초대코드 복사"}
                  title={copiedInvite ? "복사됨" : "복사하기"}
                >
                  {copiedInvite ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      aria-hidden
                    >
                      <rect
                        x="9"
                        y="9"
                        width="11"
                        height="11"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {inviteExpiresAt && (
                <span className={styles.inviteCodeMeta}>
                  만료: {formatDateTime(inviteExpiresAt)}
                </span>
              )}
            </div>
            <button
              type="button"
              className={styles.lockPrimary}
              onClick={closeInviteModal}
            >
              확인
            </button>
          </div>
        </div>
      )}

      <div
        className={`${styles.postsPane} ${locked ? styles.blurGate : ""}`}
      >
        {locked && (
          <div className={styles.lockOverlay}>
            <div className={styles.lockCard}>
              <h2 className={styles.lockTitle}>멤버만 볼 수 있어요</h2>
              <p className={styles.lockHint}>
                {authStatus !== "authenticated"
                  ? "팀 블로그는 권한이 있어야 내용을 확인할 수 있습니다."
                  : "팀 블로그는 권한이 있어야 내용을 확인할 수 있습니다. 초대코드로 팀 가입을 신청하세요."}
              </p>
              {authStatus !== "authenticated" ? (
                <Link className={styles.lockPrimary} href={nextLogin}>
                  로그인
                </Link>
              ) : (
                <form className={styles.lockForm} onSubmit={onJoin}>
                  <label className={styles.lockLabel}>
                    초대코드
                    <input
                      className={styles.lockInput}
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value);
                        if (joinError) setJoinError(null);
                      }}
                      placeholder="받은 초대코드"
                      aria-invalid={Boolean(joinError)}
                    />
                  </label>
                  {joinError && (
                    <p className={styles.lockError} role="alert">
                      {joinError}
                    </p>
                  )}
                  <button
                    className={styles.lockPrimary}
                    type="submit"
                    disabled={joining}
                  >
                    {joining ? "가입 중…" : "팀 가입 신청하기"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <div
          className={`${styles.postsPaneInner} ${locked ? styles.blurContent : ""}`}
        >
          {!loading && posts.length === 0 && (
            <p className={styles.empty}>아직 글이 없습니다.</p>
          )}
          {posts.length > 0 && (
            <>
              <div className={styles.postViewBar}>
                <span className={styles.postViewLabel}>글 목록</span>
                <div
                  className={styles.postViewToggle}
                  role="group"
                  aria-label="글 보기 방식"
                >
                  <button
                    type="button"
                    className={`${styles.postViewBtn} ${
                      postView === "list" ? styles.postViewBtnActive : ""
                    }`}
                    onClick={() => setPostView("list")}
                    aria-label="리스트형"
                    title="리스트형"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                      <path
                        d="M8 7h12M8 12h12M8 17h12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="4.5" cy="7" r="1.2" fill="currentColor" />
                      <circle cx="4.5" cy="12" r="1.2" fill="currentColor" />
                      <circle cx="4.5" cy="17" r="1.2" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${styles.postViewBtn} ${
                      postView === "thumb" ? styles.postViewBtnActive : ""
                    }`}
                    onClick={() => setPostView("thumb")}
                    aria-label="썸네일형"
                    title="썸네일형"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                      <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" />
                      <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" />
                      <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" />
                      <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>
              </div>

              {postView === "list" ? (
                <ul className={styles.list}>
                  {posts.map((post) => (
                    <li key={post.id} className={styles.listItem}>
                      <Link href={postHref({ ...post, blogId })}>
                        <h2 className={styles.postTitle}>{post.title}</h2>
                        <p className={styles.excerpt}>
                          {locked
                            ? "멤버만 볼 수 있는 내용입니다."
                            : excerpt(post.content)}
                        </p>
                        <p className={styles.postMeta}>
                          {post.ownerNickname ?? "알 수 없음"}
                          {" · "}
                          {formatDate(post.createdAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.postThumbGrid}>
                  {posts.map((post) => (
                    <li key={post.id} className={styles.postThumbCard}>
                      <Link
                        href={postHref({ ...post, blogId })}
                        className={styles.postThumbLink}
                      >
                        <div className={styles.postThumbFace} aria-hidden>
                          {(post.ownerNickname ?? post.title).slice(0, 1)}
                        </div>
                        <h2 className={styles.postThumbTitle}>{post.title}</h2>
                        <p className={styles.postThumbExcerpt}>
                          {locked
                            ? "멤버만 볼 수 있는 내용입니다."
                            : excerpt(post.content, 90)}
                        </p>
                        <p className={styles.postMeta}>
                          {post.ownerNickname ?? "알 수 없음"}
                          {" · "}
                          {formatDate(post.createdAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {pagination && pagination.total > 0 && !locked && (
        <div className={styles.pagination}>
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() =>
              router.push(`${path}?page=${pagination.page - 1}`)
            }
          >
            이전
          </button>
          <span>
            {pagination.page} / {Math.max(pagination.totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={
              pagination.page >= Math.max(pagination.totalPages, 1)
            }
            onClick={() =>
              router.push(`${path}?page=${pagination.page + 1}`)
            }
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
