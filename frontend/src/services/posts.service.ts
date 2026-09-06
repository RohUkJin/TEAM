import { apiClient } from "@/lib/api";
import type { Pagination, Post } from "@/lib/api";

export type CreatePostInput = {
  title: string;
  content: string;
  trendingVisible?: boolean;
};

export type UpdatePostInput = {
  title: string;
  content: string;
  trendingVisible?: boolean;
};

export type ListPostsQuery = {
  page?: number;
  limit?: number;
};

export type PostResult = {
  post: Post;
};

export type ListPostsResult = {
  posts: Post[];
  pagination: Pagination;
};

/**
 * Posts domain API
 */
export const postsService = {
  async list(query: ListPostsQuery = {}): Promise<ListPostsResult> {
    const result = await apiClient.getPaginated<Post[]>("/posts", {
      query: {
        page: query.page,
        limit: query.limit,
      },
    });
    return { posts: result.data, pagination: result.pagination };
  },

  async getById(id: string): Promise<Post> {
    const result = await apiClient.get<PostResult>(`/posts/${id}`);
    return result.post;
  },

  async create(input: CreatePostInput): Promise<Post> {
    const result = await apiClient.post<PostResult>("/posts", input);
    return result.post;
  },

  async update(id: string, input: UpdatePostInput): Promise<Post> {
    const result = await apiClient.put<PostResult>(`/posts/${id}`, input);
    return result.post;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete<{ deleted: boolean }>(`/posts/${id}`);
  },
};
