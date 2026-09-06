export type PostRow = {
  id: string;
  user_id: string;
  blog_id: string;
  title: string;
  content: string;
  view_count: string;
  trending_visible: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PublicPost = {
  id: string;
  userId: string;
  blogId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  commentCount?: number;
  viewCount?: number;
  trendingVisible: boolean;
  locked?: boolean;
  blogSlug?: string;
  blogType?: "personal" | "team";
  ownerNickname?: string | null;
  ownerUrlSlug?: string | null;
};

export function toPublicPost(
  row: PostRow,
  extras?: {
    commentCount?: number;
    locked?: boolean;
    blogSlug?: string;
    blogType?: "personal" | "team";
    ownerNickname?: string | null;
    ownerUrlSlug?: string | null;
  },
): PublicPost {
  return {
    id: row.id,
    userId: row.user_id,
    blogId: row.blog_id,
    title: row.title,
    content: extras?.locked ? "" : row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    commentCount: extras?.commentCount,
    viewCount: Number(row.view_count ?? 0),
    trendingVisible: Boolean(row.trending_visible),
    locked: extras?.locked ?? false,
    blogSlug: extras?.blogSlug,
    blogType: extras?.blogType,
    ownerNickname: extras?.ownerNickname ?? null,
    ownerUrlSlug: extras?.ownerUrlSlug ?? null,
  };
}
