import { blogRepository } from "../repositories/blog.repository";
import { postRepository } from "../repositories/post.repository";
import { userRepository } from "../repositories/user.repository";
import { PublicBlog, toPublicBlog } from "../types/blog";
import { PublicPost, toPublicPost } from "../types/post";
import {
  buildPaginationMeta,
  PaginationMeta,
} from "../utils/pagination";

export type FeedPostSort = "views" | "comments";

export type FeedPeriod = {
  year: number;
  month: number;
};

export type HomeFeed = {
  popularPosts: PublicPost[];
  popularTeams: PublicBlog[];
  sort: FeedPostSort;
  /** 인기글 집계 월 (달력 기준, Asia/Seoul) */
  period: FeedPeriod;
  popularPostsPagination: PaginationMeta;
};

/** Asia/Seoul 달력 기준 당월 [start, end) */
export function currentCalendarMonthPeriod(now = new Date()): {
  period: FeedPeriod;
  periodStart: Date;
  periodEnd: Date;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);

  // Seoul offset is +09:00 year-round (no DST)
  const periodStart = new Date(
    Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - 9 * 60 * 60 * 1000,
  );
  const periodEnd = new Date(
    Date.UTC(year, month, 1, 0, 0, 0, 0) - 9 * 60 * 60 * 1000,
  );

  return {
    period: { year, month },
    periodStart,
    periodEnd,
  };
}

export class FeedService {
  async getHomeFeed(
    viewerUserId?: string,
    options: {
      postPage?: number;
      postLimit?: number;
      teamLimit?: number;
      sort?: FeedPostSort;
    } = {},
  ): Promise<HomeFeed> {
    const postPage = options.postPage ?? 1;
    const postLimit = options.postLimit ?? 9;
    const teamLimit = options.teamLimit ?? 8;
    const sort: FeedPostSort =
      options.sort === "comments" ? "comments" : "views";
    const { period, periodStart, periodEnd } = currentCalendarMonthPeriod();
    const postOffset = (postPage - 1) * postLimit;

    const [postRows, postTotal, teamRows] = await Promise.all([
      postRepository.findPopularPersonal({
        limit: postLimit,
        offset: postOffset,
        sort,
        periodStart,
        periodEnd,
      }),
      postRepository.countPopularPersonal({ periodStart, periodEnd }),
      blogRepository.findPopularTeams(teamLimit),
    ]);

    let memberships = new Map<string, { role: "owner" | "member" }>();
    if (viewerUserId && teamRows.length > 0) {
      const map = await blogRepository.findMembersByBlogIds(
        teamRows.map((r) => r.id),
        viewerUserId,
      );
      memberships = new Map(
        [...map.entries()].map(([id, m]) => [id, { role: m.role }]),
      );
    }

    const ownerIds = [
      ...new Set([
        ...postRows.map((r) => r.user_id),
        ...teamRows.map((r) => r.owner_id),
      ]),
    ];
    const owners = await userRepository.findOwnerMetaByIds(ownerIds);

    const blogIds = [...new Set(postRows.map((r) => r.blog_id))];
    const blogs = await Promise.all(
      blogIds.map((id) => blogRepository.findById(id)),
    );
    const blogMap = new Map(
      blogs.filter(Boolean).map((b) => [b!.id, b!] as const),
    );

    return {
      sort,
      period,
      popularPostsPagination: buildPaginationMeta(
        postPage,
        postLimit,
        postTotal,
      ),
      popularPosts: postRows.map((row) => {
        const blog = blogMap.get(row.blog_id);
        const owner = owners.get(row.user_id);
        return toPublicPost(row, {
          commentCount: Number(row.comment_count),
          blogSlug: blog?.slug,
          blogType: blog?.type,
          ownerNickname: owner?.nickname ?? null,
          ownerUrlSlug: owner?.urlSlug ?? null,
        });
      }),
      popularTeams: teamRows.map((row) => {
        const m = memberships.get(row.id);
        const owner = owners.get(row.owner_id);
        return toPublicBlog(row, {
          isMember: Boolean(m),
          role: m?.role ?? null,
          memberCount: Number(row.member_count),
          ownerNickname: owner?.nickname ?? null,
          ownerUrlSlug: owner?.urlSlug ?? null,
        });
      }),
    };
  }
}

export const feedService = new FeedService();
