/** Backend 공개 응답 타입 (API envelope의 data 필드) */

export type User = {
  id: string;
  email: string;
  nickname: string;
  urlSlug: string;
  emailVerified: boolean;
  createdAt: string;
};

export type Post = {
  id: string;
  userId: string;
  blogId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  viewCount?: number;
  trendingVisible?: boolean;
  locked?: boolean;
  blogSlug?: string;
  blogType?: BlogType;
  ownerNickname?: string | null;
  ownerUrlSlug?: string | null;
};

export type BlogType = "personal" | "team";
export type BlogMemberRole = "owner" | "member";

export type Blog = {
  id: string;
  ownerId: string;
  type: BlogType;
  name: string;
  slug: string;
  description: string;
  ownerNickname: string | null;
  ownerUrlSlug: string | null;
  createdAt: string;
  updatedAt: string;
  isMember: boolean;
  role: BlogMemberRole | null;
  memberCount: number;
};

export type TeamCreateStatus = {
  hasCreated: boolean;
  lastCreatedAt: string | null;
  canCreate: boolean;
  nextAvailableAt: string | null;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  nickname: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T;
  pagination: Pagination;
};
