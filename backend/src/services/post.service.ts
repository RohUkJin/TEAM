import { blogService } from "./blog.service";
import { blogRepository } from "../repositories/blog.repository";
import { postRepository } from "../repositories/post.repository";
import { userRepository } from "../repositories/user.repository";
import { PublicPost, toPublicPost } from "../types/post";
import { AppError } from "../utils/AppError";
import { assertResourceOwner } from "../utils/authorization";
import {
  buildPaginationMeta,
  PaginationMeta,
  PaginationQuery,
} from "../utils/pagination";
import {
  CreatePostBody,
  UpdatePostBody,
} from "../validators/postComment.validators";

export type PaginatedPosts = {
  posts: PublicPost[];
  pagination: PaginationMeta;
};

export class PostService {
  async createInBlog(
    userId: string,
    blogId: string,
    input: CreatePostBody,
  ): Promise<PublicPost> {
    await blogService.assertCanWrite(blogId, userId);
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");

    const trendingVisible =
      blog.type === "personal" ? Boolean(input.trendingVisible) : false;

    const created = await postRepository.create({
      userId,
      blogId,
      title: input.title,
      content: input.content,
      trendingVisible,
    });
    return toPublicPost(created);
  }

  /** legacy: 개인 블로그에 작성 */
  async create(userId: string, input: CreatePostBody): Promise<PublicPost> {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.unauthorized();
    const personal = await blogService.ensurePersonalBlog(userId, user.email);
    return this.createInBlog(userId, personal.id, input);
  }

  async getById(
    postId: string,
    viewerUserId?: string,
    viewerIp?: string,
  ): Promise<PublicPost> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw AppError.notFound("Post not found");
    }

    const blog = await blogRepository.findById(post.blog_id);
    if (!blog) throw AppError.notFound("Blog not found");
    const owner = await userRepository.findById(blog.owner_id);
    const canRead = await blogService.canReadContent(
      post.blog_id,
      viewerUserId,
    );

    if (!canRead) {
      return toPublicPost(post, {
        locked: true,
        blogSlug: blog.slug,
        blogType: blog.type,
        ownerNickname: owner?.nickname ?? null,
        ownerUrlSlug: owner?.url_slug ?? null,
      });
    }

    if (viewerIp) {
      await postRepository.recordViewIfNew(postId, viewerIp);
    }
    const refreshed = await postRepository.findById(postId);
    return toPublicPost(refreshed ?? post, {
      blogSlug: blog.slug,
      blogType: blog.type,
      ownerNickname: owner?.nickname ?? null,
      ownerUrlSlug: owner?.url_slug ?? null,
    });
  }

  async listByBlog(
    blogId: string,
    pagination: PaginationQuery,
    viewerUserId?: string,
  ): Promise<PaginatedPosts> {
    const blog = await blogRepository.findById(blogId);
    if (!blog) throw AppError.notFound("Blog not found");
    const canRead = await blogService.canReadContent(blogId, viewerUserId);

    const [rows, total] = await Promise.all([
      postRepository.findManyByBlogId({
        blogId,
        limit: pagination.limit,
        offset: pagination.offset,
      }),
      postRepository.countByBlogId(blogId),
    ]);

    const owners = await userRepository.findOwnerMetaByIds(
      rows.map((row) => row.user_id),
    );

    return {
      posts: rows.map((row) => {
        const owner = owners.get(row.user_id);
        return toPublicPost(row, {
          locked: !canRead,
          blogSlug: blog.slug,
          blogType: blog.type,
          ownerNickname: owner?.nickname ?? null,
          ownerUrlSlug: owner?.urlSlug ?? null,
        });
      }),
      pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  /** 공개 피드: 개인 블로그 글만 */
  async list(pagination: PaginationQuery): Promise<PaginatedPosts> {
    const [rows, total] = await Promise.all([
      postRepository.findManyPublicPersonal({
        limit: pagination.limit,
        offset: pagination.offset,
      }),
      postRepository.countPublicPersonal(),
    ]);

    return {
      posts: rows.map((row) => toPublicPost(row)),
      pagination: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async update(
    authenticatedUserId: string,
    postId: string,
    input: UpdatePostBody,
  ): Promise<PublicPost> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw AppError.notFound("Post not found");
    }

    await blogService.assertCanReadContent(post.blog_id, authenticatedUserId);
    assertResourceOwner(authenticatedUserId, post.user_id);

    const blog = await blogRepository.findById(post.blog_id);
    const trendingVisible =
      blog?.type === "personal" ? Boolean(input.trendingVisible) : false;

    const updated = await postRepository.update(postId, {
      title: input.title,
      content: input.content,
      trendingVisible,
    });
    if (!updated) {
      throw AppError.notFound("Post not found");
    }
    return toPublicPost(updated);
  }

  async delete(authenticatedUserId: string, postId: string): Promise<void> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw AppError.notFound("Post not found");
    }

    await blogService.assertCanReadContent(post.blog_id, authenticatedUserId);
    assertResourceOwner(authenticatedUserId, post.user_id);

    await postRepository.deleteById(postId);
  }
}

export const postService = new PostService();
