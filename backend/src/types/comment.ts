export type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
};

export type PublicComment = {
  id: string;
  postId: string;
  userId: string;
  nickname: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toPublicComment(
  row: CommentRow,
  nickname?: string | null,
): PublicComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    nickname: nickname ?? null,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
