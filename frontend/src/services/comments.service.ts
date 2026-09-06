import { apiClient } from "@/lib/api";
import type { Comment } from "@/lib/api";

export type CreateCommentInput = {
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};

export type CommentResult = {
  comment: Comment;
};

export type CommentsResult = {
  comments: Comment[];
};

/**
 * Comments domain API
 */
export const commentsService = {
  async listByPost(postId: string): Promise<Comment[]> {
    const result = await apiClient.get<CommentsResult>(
      `/posts/${postId}/comments`,
    );
    return result.comments;
  },

  async create(postId: string, input: CreateCommentInput): Promise<Comment> {
    const result = await apiClient.post<CommentResult>(
      `/posts/${postId}/comments`,
      input,
    );
    return result.comment;
  },

  async update(
    commentId: string,
    input: UpdateCommentInput,
  ): Promise<Comment> {
    const result = await apiClient.put<CommentResult>(
      `/comments/${commentId}`,
      input,
    );
    return result.comment;
  },

  async remove(commentId: string): Promise<void> {
    await apiClient.delete<{ deleted: boolean }>(`/comments/${commentId}`);
  },
};

export type { Comment };
