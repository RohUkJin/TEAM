import { blogService } from "./blog.service";
import { commentRepository } from "../repositories/comment.repository";
import { postRepository } from "../repositories/post.repository";
import { userRepository } from "../repositories/user.repository";
import { PublicComment, toPublicComment } from "../types/comment";
import { AppError } from "../utils/AppError";
import { assertResourceOwner } from "../utils/authorization";
import {
  CreateCommentBody,
  UpdateCommentBody,
} from "../validators/postComment.validators";

export class CommentService {
  async create(
    authenticatedUserId: string,
    postId: string,
    input: CreateCommentBody,
  ): Promise<PublicComment> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw AppError.notFound("Post not found");
    }

    // 댓글은 글쓰기(멤버) 권한이 아니라, 글을 읽을 수 있는 로그인 사용자면 허용
    await blogService.assertCanReadContent(post.blog_id, authenticatedUserId);

    const created = await commentRepository.create({
      postId,
      userId: authenticatedUserId,
      content: input.content,
    });
    const author = await userRepository.findById(authenticatedUserId);
    return toPublicComment(created, author?.nickname ?? null);
  }

  async listByPostId(
    postId: string,
    viewerUserId?: string,
  ): Promise<PublicComment[]> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw AppError.notFound("Post not found");
    }

    await blogService.assertCanReadContent(post.blog_id, viewerUserId);

    const rows = await commentRepository.findByPostId(postId);
    const nicknames = await userRepository.findNicknamesByIds(
      rows.map((row) => row.user_id),
    );
    return rows.map((row) =>
      toPublicComment(row, nicknames.get(row.user_id) ?? null),
    );
  }

  async update(
    authenticatedUserId: string,
    commentId: string,
    input: UpdateCommentBody,
  ): Promise<PublicComment> {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw AppError.notFound("Comment not found");
    }

    const post = await postRepository.findById(comment.post_id);
    if (!post) {
      throw AppError.notFound("Post not found");
    }
    await blogService.assertCanReadContent(post.blog_id, authenticatedUserId);

    assertResourceOwner(authenticatedUserId, comment.user_id);

    const updated = await commentRepository.update(commentId, {
      content: input.content,
    });
    if (!updated) {
      throw AppError.notFound("Comment not found");
    }

    const author = await userRepository.findById(updated.user_id);
    return toPublicComment(updated, author?.nickname ?? null);
  }

  async delete(authenticatedUserId: string, commentId: string): Promise<void> {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw AppError.notFound("Comment not found");
    }

    const post = await postRepository.findById(comment.post_id);
    if (!post) {
      throw AppError.notFound("Post not found");
    }
    await blogService.assertCanReadContent(post.blog_id, authenticatedUserId);

    assertResourceOwner(authenticatedUserId, comment.user_id);

    await commentRepository.deleteById(commentId);
  }
}

export const commentService = new CommentService();
