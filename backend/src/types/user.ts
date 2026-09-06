export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  nickname: string;
  url_slug: string;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PublicUser = {
  id: string;
  email: string;
  nickname: string;
  urlSlug: string;
  emailVerified: boolean;
  createdAt: Date;
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    urlSlug: row.url_slug,
    emailVerified: row.email_verified,
    createdAt: row.created_at,
  };
}
