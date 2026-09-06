export type BlogType = "personal" | "team";
export type BlogMemberRole = "owner" | "member";

export type BlogRow = {
  id: string;
  owner_id: string;
  type: BlogType;
  name: string;
  slug: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};

export type BlogMemberRow = {
  blog_id: string;
  user_id: string;
  role: BlogMemberRole;
  joined_at: Date;
};

export type BlogInviteCodeRow = {
  id: string;
  blog_id: string;
  token_hash: string;
  created_by: string;
  created_at: Date;
  expires_at: Date;
  used_at: Date | null;
  used_by_user_id: string | null;
};

export type PublicBlog = {
  id: string;
  ownerId: string;
  type: BlogType;
  name: string;
  slug: string;
  description: string;
  ownerNickname: string | null;
  ownerUrlSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
  isMember: boolean;
  role: BlogMemberRole | null;
  memberCount: number;
};

export type TeamCreateStatus = {
  hasCreated: boolean;
  lastCreatedAt: Date | null;
  canCreate: boolean;
  nextAvailableAt: Date | null;
};

export function toPublicBlog(
  row: BlogRow,
  membership?: {
    isMember: boolean;
    role: BlogMemberRole | null;
    memberCount?: number;
    ownerNickname?: string | null;
    ownerUrlSlug?: string | null;
  },
): PublicBlog {
  return {
    id: row.id,
    ownerId: row.owner_id,
    type: row.type,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    ownerNickname: membership?.ownerNickname ?? null,
    ownerUrlSlug: membership?.ownerUrlSlug ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isMember: membership?.isMember ?? false,
    role: membership?.role ?? null,
    memberCount: membership?.memberCount ?? 0,
  };
}
