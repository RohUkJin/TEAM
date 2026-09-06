"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import type { Blog, Pagination, Post } from "@/lib/api";
import { excerpt, formatDate, getErrorMessage } from "@/lib/ui";
import { blogHref, postHref } from "@/lib/paths";
import { blogsService, feedService, type BlogTeamSort, type FeedPostSort } from "@/services";
import { useAuthStore } from "@/stores";
import { PostMetaStats } from "@/components/PostMetaStats";
import styles from "@/app/page.module.css";

const PAGE_LIMIT = 5;
const TEAM_PAGE_LIMIT = 6;
/** 데스크톱: 인기 팀 섹션이 살짝 보이도록 9개 */
const TRENDING_POST_LIMIT_DESKTOP = 9;
/** 모바일: 첫 화면에 4개만, 나머지는 펼치기 */
const TRENDING_POST_LIMIT_MOBILE = 4;
const MOBILE_TRENDING_MQ = "(max-width: 640px)";

const TEAM_SORT_OPTIONS: Array<{ value: BlogTeamSort; label: string }> = [
  { value: "members_desc", label: "멤버 많은 순" },
  { value: "members_asc", label: "멤버 적은 순" },
  { value: "created_desc", label: "최근 생성 순" },
  { value: "created_asc", label: "오래된 생성 순" },
];

function parseTeamSort(raw: string | null): BlogTeamSort {
  if (
    raw === "members_asc" ||
    raw === "created_desc" ||
    raw === "created_asc"
  ) {
    return raw;
  }
  return "members_desc";
}

const THUMB_PALETTES = [
  ["#12b886", "#0b7285"],
  ["#4c6ef5", "#15aabf"],
  ["#f76707", "#e8590c"],
  ["#ae3ec9", "#7048e8"],
  ["#087f5b", "#0c8599"],
  ["#e64980", "#be4bdb"],
];

type HomeTab = "trending" | "personal" | "team";

function parseTab(raw: string | null): HomeTab {
  if (raw === "personal" || raw === "team") return raw;
  return "trending";
}

function teamThumbStyle(blog: Blog): CSSProperties {
  const seed = Number(blog.id) || blog.name.length;
  const [a, b] = THUMB_PALETTES[seed % THUMB_PALETTES.length];
  return {
    background: `linear-gradient(145deg, ${a} 0%, ${b} 100%)`,
  };
}

function teamInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "T";
}

function TeamCard({ blog }: { blog: Blog }) {
  const desc = blog.description?.trim();
  return (
    <li className={styles.teamCard}>
      <Link href={blogHref(blog)} className={styles.teamCardLink}>
        <div className={styles.teamCardTop}>
          <div
            className={styles.teamThumb}
            style={teamThumbStyle(blog)}
            aria-hidden
          >
            {teamInitial(blog.name)}
          </div>
          <div className={styles.teamInfo}>
            <strong>{blog.name}</strong>
            <span>
              멤버 {blog.memberCount ?? 0}
              {blog.isMember ? " · 참여 중" : ""}
              {" · "}
              {formatDate(blog.createdAt)}
            </span>
          </div>
        </div>
        <p className={styles.teamDesc}>
          {desc ? excerpt(desc, 80) : "아직 팀 소개가 없습니다."}
        </p>
      </Link>
    </li>
  );
}

function TeamCardGrid({ items }: { items: Blog[] }) {
  return (
    <ul className={styles.teamGrid}>
      {items.map((blog) => (
        <TeamCard key={blog.id} blog={blog} />
      ))}
    </ul>
  );
}

function ExpandDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9.5 12 15.5 18 9.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.5 16.5 9 11l3.5 3.5L20 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 7H20v5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5.5 19.25c.9-3.2 3.3-5 6.5-5s5.6 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="9" cy="8" r="2.75" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.5" cy="9" r="2.25" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3.75 19c.75-2.7 2.7-4.25 5.25-4.25S13.5 16.3 14.25 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 14.9c1.7.15 3.15 1.15 3.85 3.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const teamSort = parseTeamSort(searchParams.get("sort"));

  const authStatus = useAuthStore((s) => s.status);

  const [sort, setSort] = useState<FeedPostSort>("views");
  const [posts, setPosts] = useState<Post[]>([]);
  const [teams, setTeams] = useState<Blog[]>([]);
  const [trendingMonth, setTrendingMonth] = useState<number | null>(null);
  const [trendingPage, setTrendingPage] = useState(1);
  const [trendingHasMore, setTrendingHasMore] = useState(false);
  const [expandingTrending, setExpandingTrending] = useState(false);
  const [trendingPostLimit, setTrendingPostLimit] = useState(
    TRENDING_POST_LIMIT_DESKTOP,
  );
  const [trendingLimitReady, setTrendingLimitReady] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [myBlog, setMyBlog] = useState<Blog | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalPostView, setPersonalPostView] = useState<"list" | "thumb">(
    "list",
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_TRENDING_MQ);
    const sync = () => {
      setTrendingPostLimit(
        mq.matches
          ? TRENDING_POST_LIMIT_MOBILE
          : TRENDING_POST_LIMIT_DESKTOP,
      );
      setTrendingLimitReady(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await Promise.resolve();
      if (cancelled) return;
      // 모바일/데스크톱 limit이 정해진 뒤에 트렌딩을 불러와 깜빡임·중복 요청을 줄임
      if (tab === "trending" && !trendingLimitReady) return;
      setLoading(true);
      setError(null);
      try {
        if (tab === "trending") {
          const feed = await feedService.getHome({
            sort,
            page: 1,
            limit: trendingPostLimit,
          });
          if (cancelled) return;
          setPosts(feed.popularPosts);
          setTeams(feed.popularTeams);
          setTrendingMonth(feed.period?.month ?? null);
          setTrendingPage(feed.popularPostsPagination.page);
          setTrendingHasMore(
            feed.popularPostsPagination.page <
              feed.popularPostsPagination.totalPages,
          );
          setBlogs([]);
          setMyBlog(null);
          setPagination(null);
        } else if (tab === "personal") {
          if (authStatus !== "authenticated") {
            if (cancelled) return;
            setPosts([]);
            setTeams([]);
            setBlogs([]);
            setMyBlog(null);
            setPagination(null);
            return;
          }
          const blog = await blogsService.getMine();
          const result = await blogsService.listPosts(blog.id, {
            page,
            limit: PAGE_LIMIT,
          });
          if (cancelled) return;
          setMyBlog(blog);
          setPosts(result.posts);
          setPagination(result.pagination);
          setBlogs([]);
          setTeams([]);
        } else {
          const result = await blogsService.list({
            page,
            limit: TEAM_PAGE_LIMIT,
            type: "team",
            sort: teamSort,
          });
          if (cancelled) return;
          setBlogs(result.blogs);
          setPagination(result.pagination);
          setPosts([]);
          setTeams([]);
          setMyBlog(null);
        }
      } catch (err) {
        if (cancelled) return;
        setPosts([]);
        setTeams([]);
        setBlogs([]);
        setMyBlog(null);
        setPagination(null);
        setTrendingHasMore(false);
        setError(
          getErrorMessage(
            err,
            tab === "trending"
              ? "피드를 불러오지 못했습니다"
              : tab === "personal"
                ? "내 블로그를 불러오지 못했습니다"
                : "블로그를 불러오지 못했습니다",
          ),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    authStatus,
    sort,
    tab,
    page,
    teamSort,
    trendingPostLimit,
    trendingLimitReady,
  ]);

  async function expandTrendingPosts() {
    if (expandingTrending || !trendingHasMore) return;
    setExpandingTrending(true);
    setError(null);
    try {
      const nextPage = trendingPage + 1;
      const feed = await feedService.getHome({
        sort,
        page: nextPage,
        limit: trendingPostLimit,
      });
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const appended = feed.popularPosts.filter((p) => !seen.has(p.id));
        return [...prev, ...appended];
      });
      setTrendingPage(feed.popularPostsPagination.page);
      setTrendingHasMore(
        feed.popularPostsPagination.page <
          feed.popularPostsPagination.totalPages,
      );
    } catch (err) {
      setError(getErrorMessage(err, "인기 글을 더 불러오지 못했습니다"));
    } finally {
      setExpandingTrending(false);
    }
  }
  function goTab(next: HomeTab) {
    if (next === "trending") {
      router.push("/");
      return;
    }
    router.push(`/?tab=${next}`);
  }

  function goPage(next: number) {
    if (tab === "team") {
      router.push(`/?tab=team&sort=${teamSort}&page=${next}`);
      return;
    }
    router.push(`/?tab=${tab}&page=${next}`);
  }

  function goTeamSort(next: BlogTeamSort) {
    router.push(`/?tab=team&sort=${next}`);
  }

  // 개인 탭만 로그인 필요 — 트렌딩/팀은 비로그인도 진입
  if (authStatus === "loading" && tab === "personal") {
    return (
      <main className={styles.feedShell}>
        <p className={styles.state}>불러오는 중…</p>
      </main>
    );
  }

  return (
    <main className={styles.feedShell}>
      <div className={styles.toolbar}>
        <nav className={styles.tabs} aria-label="홈 탭">
          <button
            type="button"
            className={`${styles.tab} ${tab === "trending" ? styles.tabActive : ""}`}
            onClick={() => goTab("trending")}
          >
            <TrendingIcon className={styles.tabIcon} />
            트렌딩
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === "personal" ? styles.tabActive : ""}`}
            onClick={() => goTab("personal")}
          >
            <PersonIcon className={styles.tabIcon} />
            개인 블로그
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === "team" ? styles.tabActive : ""}`}
            onClick={() => goTab("team")}
          >
            <PeopleIcon className={styles.tabIcon} />
            팀 블로그
          </button>
        </nav>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {tab === "trending" && (
        <>
          <section className={styles.postsSection} aria-labelledby="popular-posts">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitleBlock}>
                <h2 id="popular-posts">
                  {trendingMonth != null ? `${trendingMonth}월 인기 글` : "인기 글"}
                </h2>
                <p className={styles.sectionDesc}>
                  이번 달에 작성된 개인 블로그 글만 집계됩니다.
                </p>
              </div>
              <div className={styles.sortGroup} role="group" aria-label="인기글 정렬">
                <button
                  type="button"
                  className={`${styles.sortChip} ${sort === "views" ? styles.sortChipActive : ""}`}
                  onClick={() => setSort("views")}
                >
                  조회순
                </button>
                <button
                  type="button"
                  className={`${styles.sortChip} ${sort === "comments" ? styles.sortChipActive : ""}`}
                  onClick={() => setSort("comments")}
                >
                  댓글순
                </button>
              </div>
            </div>

            {loading ? (
              <p className={styles.empty}>불러오는 중…</p>
            ) : posts.length === 0 ? (
              <p className={styles.empty}>이번 달 인기 글이 아직 없습니다.</p>
            ) : (
              <>
                <ul className={styles.cardGrid}>
                  {posts.map((post) => (
                    <li key={post.id} className={styles.postCard}>
                      <Link href={postHref(post)} className={styles.postCardLink}>
                        <h3 className={styles.cardTitle}>{post.title}</h3>
                        <p className={styles.cardExcerpt}>
                          {excerpt(post.content, 140)}
                        </p>
                        <p className={styles.cardMeta}>
                          <PostMetaStats
                            dateLabel={formatDate(post.createdAt)}
                            dateTime={post.createdAt}
                            views={post.viewCount ?? 0}
                            comments={post.commentCount ?? 0}
                          />
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
                {trendingHasMore && (
                  <div className={styles.expandWrap}>
                    <button
                      type="button"
                      className={styles.expandButton}
                      disabled={expandingTrending}
                      onClick={() => void expandTrendingPosts()}
                      aria-label={
                        expandingTrending
                          ? "인기 글 불러오는 중"
                          : "인기 글 더 보기"
                      }
                    >
                      <ExpandDownIcon className={styles.expandIcon} />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className={styles.teamsSection} aria-labelledby="popular-teams">
            <div className={styles.sectionHead}>
              <h2 id="popular-teams">인기 팀</h2>
              <span>멤버 수 순</span>
            </div>

            {teams.length === 0 ? (
              <p className={styles.empty}>아직 팀 블로그가 없습니다.</p>
            ) : (
              <TeamCardGrid items={teams} />
            )}
          </section>
        </>
      )}

      {tab === "personal" && (
        <section
          className={`${styles.postsSection} ${styles.pagedSection}`}
          aria-labelledby="my-blog"
        >
          {authStatus !== "authenticated" ? (
            <div className={styles.emptyBlock}>
              <p className={styles.empty}>로그인이 필요한 내 공간입니다.</p>
              <Link
                href={`/login?next=${encodeURIComponent("/?tab=personal")}`}
                className={styles.toolbarAction}
              >
                로그인하기
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.sectionHead}>
                <div className={styles.sectionTitleBlock}>
                  <div className={styles.sectionTitleRow}>
                    <h2 id="my-blog">{myBlog?.name ?? "내 블로그"}</h2>
                    {myBlog && (
                      <Link
                        href={`/blogs/${myBlog.id}/write`}
                        className={styles.sectionAction}
                      >
                        새 글 작성
                      </Link>
                    )}
                  </div>
                  <p className={styles.sectionDesc}>
                    나만의 개인 공간입니다. 여기서 쓴 글만 모입니다.
                  </p>
                </div>
                {posts.length > 0 && (
                  <div
                    className={styles.postViewToggle}
                    role="group"
                    aria-label="글 보기 방식"
                  >
                    <button
                      type="button"
                      className={`${styles.postViewBtn} ${
                        personalPostView === "list"
                          ? styles.postViewBtnActive
                          : ""
                      }`}
                      onClick={() => setPersonalPostView("list")}
                      aria-label="리스트형"
                      title="리스트형"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        aria-hidden
                      >
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
                        personalPostView === "thumb"
                          ? styles.postViewBtnActive
                          : ""
                      }`}
                      onClick={() => setPersonalPostView("thumb")}
                      aria-label="썸네일형"
                      title="썸네일형"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        aria-hidden
                      >
                        <rect
                          x="3"
                          y="3"
                          width="8"
                          height="8"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="13"
                          y="3"
                          width="8"
                          height="8"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="3"
                          y="13"
                          width="8"
                          height="8"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="13"
                          y="13"
                          width="8"
                          height="8"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <p className={styles.empty}>불러오는 중…</p>
              ) : posts.length === 0 ? (
                <p className={styles.empty}>아직 작성한 글이 없습니다.</p>
              ) : personalPostView === "list" ? (
                <ul className={styles.feedPostList}>
                  {posts.map((post) => (
                    <li key={post.id} className={styles.feedPostItem}>
                      <Link href={postHref(post)}>
                        <h3 className={styles.feedPostTitle}>{post.title}</h3>
                        <p className={styles.feedPostExcerpt}>
                          {excerpt(post.content)}
                        </p>
                        <p className={styles.feedPostMeta}>
                          <PostMetaStats
                            dateLabel={formatDate(post.createdAt)}
                            dateTime={post.createdAt}
                            views={post.viewCount ?? 0}
                            comments={post.commentCount ?? 0}
                          />
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.cardGrid}>
                  {posts.map((post) => (
                    <li key={post.id} className={styles.postCard}>
                      <Link
                        href={postHref(post)}
                        className={styles.postCardLink}
                      >
                        <h3 className={styles.cardTitle}>{post.title}</h3>
                        <p className={styles.cardExcerpt}>
                          {excerpt(post.content, 140)}
                        </p>
                        <p className={styles.cardMeta}>
                          <PostMetaStats
                            dateLabel={formatDate(post.createdAt)}
                            dateTime={post.createdAt}
                            views={post.viewCount ?? 0}
                            comments={post.commentCount ?? 0}
                          />
                        </p>
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
                      loading ||
                      pagination.page >= Math.max(pagination.totalPages, 1)
                    }
                    onClick={() => goPage(pagination.page + 1)}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {tab === "team" && (
        <section
          className={`${styles.blogsSection} ${styles.pagedSection}`}
          aria-labelledby="blogs-heading"
        >
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitleBlock}>
              <div className={styles.sectionTitleRow}>
                <h2 id="blogs-heading">팀 블로그</h2>
                {authStatus === "authenticated" && (
                  <Link href="/blogs/new" className={styles.sectionAction}>
                    팀 만들기
                  </Link>
                )}
              </div>
              <p className={styles.sectionDesc}>
                팀 블로그는 초대코드로 입장합니다.
              </p>
            </div>
            <div className={styles.sortGroup} role="group" aria-label="팀 정렬">
              {TEAM_SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.sortChip} ${
                    teamSort === option.value ? styles.sortChipActive : ""
                  }`}
                  onClick={() => goTeamSort(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className={styles.empty}>불러오는 중…</p>
          ) : blogs.length === 0 ? (
            <p className={styles.empty}>아직 팀 블로그가 없습니다.</p>
          ) : (
            (() => {
              const joined = blogs.filter((b) => b.isMember);
              const others = blogs.filter((b) => !b.isMember);

              return (
                <div className={styles.teamGroups}>
                  {joined.length > 0 && (
                    <div className={styles.teamGroup}>
                      <h3 className={styles.teamGroupTitle}>참여 중</h3>
                      <TeamCardGrid items={joined} />
                    </div>
                  )}
                  {others.length > 0 && (
                    <div className={styles.teamGroup}>
                      <h3 className={styles.teamGroupTitle}>
                        {joined.length > 0 ? "다른 팀" : "전체 팀"}
                      </h3>
                      <TeamCardGrid items={others} />
                    </div>
                  )}
                </div>
              );
            })()
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
                  loading ||
                  pagination.page >= Math.max(pagination.totalPages, 1)
                }
                onClick={() => goPage(pagination.page + 1)}
              >
                다음
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
