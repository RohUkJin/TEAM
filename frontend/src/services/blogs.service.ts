import { apiClient } from "@/lib/api";
import type { Blog, Pagination, Post, TeamCreateStatus } from "@/lib/api";

export type BlogTeamSort =
  | "members_desc"
  | "members_asc"
  | "created_desc"
  | "created_asc";

export type CreateBlogInput = {
  type: "personal" | "team";
  name: string;
  description?: string;
};

export type ListBlogsQuery = {
  page?: number;
  limit?: number;
  type?: "personal" | "team";
  sort?: BlogTeamSort;
};

export type BlogResult = { blog: Blog };
export type ListBlogsResult = { blogs: Blog[]; pagination: Pagination };
export type InviteResult = {
  code: string;
  blogId: string;
  expiresAt: string;
};
export type ListBlogPostsResult = { posts: Post[]; pagination: Pagination };
export type TeamCreateStatusResult = { status: TeamCreateStatus };
export type CheckTeamNameResult = { name: string; available: boolean };

export const blogsService = {
  async list(query: ListBlogsQuery = {}): Promise<ListBlogsResult> {
    const result = await apiClient.getPaginated<Blog[]>("/blogs", {
      query: {
        page: query.page,
        limit: query.limit,
        type: query.type,
        sort: query.sort,
      },
    });
    return { blogs: result.data, pagination: result.pagination };
  },

  async getMine(): Promise<Blog> {
    const result = await apiClient.get<BlogResult>("/blogs/me");
    return result.blog;
  },

  async getTeamCreateStatus(): Promise<TeamCreateStatus> {
    const result =
      await apiClient.get<TeamCreateStatusResult>("/blogs/team-create-status");
    return result.status;
  },

  async checkTeamName(name: string): Promise<CheckTeamNameResult> {
    return apiClient.get<CheckTeamNameResult>("/blogs/check-name", {
      query: { name },
    });
  },

  async resolve(input: {
    kind: "personal" | "team";
    urlSlug?: string;
    /** @deprecated use urlSlug */
    nickname?: string;
    slug: string;
  }): Promise<Blog> {
    const result = await apiClient.get<BlogResult>("/blogs/resolve", {
      query: {
        kind: input.kind,
        urlSlug: input.urlSlug ?? input.nickname,
        slug: input.slug,
      },
    });
    return result.blog;
  },

  async getById(id: string): Promise<Blog> {
    const result = await apiClient.get<BlogResult>(`/blogs/${id}`);
    return result.blog;
  },

  async getMeta(id: string): Promise<Blog> {
    const result = await apiClient.get<BlogResult>(`/blogs/${id}/meta`);
    return result.blog;
  },

  async create(input: CreateBlogInput): Promise<Blog> {
    const result = await apiClient.post<BlogResult>("/blogs", input);
    return result.blog;
  },

  async updateDescription(id: string, description: string): Promise<Blog> {
    const result = await apiClient.patch<BlogResult>(`/blogs/${id}`, {
      description,
    });
    return result.blog;
  },

  async updateName(id: string, name: string): Promise<Blog> {
    const result = await apiClient.patch<BlogResult>(`/blogs/${id}`, { name });
    return result.blog;
  },

  async join(id: string, code: string): Promise<Blog> {
    const result = await apiClient.post<BlogResult>(`/blogs/${id}/join`, {
      code,
    });
    return result.blog;
  },

  async createInvite(id: string): Promise<InviteResult> {
    return apiClient.post<InviteResult>(`/blogs/${id}/invites`);
  },

  async listPosts(
    blogId: string,
    query: { page?: number; limit?: number } = {},
  ): Promise<ListBlogPostsResult> {
    const result = await apiClient.getPaginated<Post[]>(
      `/blogs/${blogId}/posts`,
      { query: { page: query.page, limit: query.limit } },
    );
    return { posts: result.data, pagination: result.pagination };
  },

  async createPost(
    blogId: string,
    input: { title: string; content: string; trendingVisible?: boolean },
  ): Promise<Post> {
    const result = await apiClient.post<{ post: Post }>(
      `/blogs/${blogId}/posts`,
      input,
    );
    return result.post;
  },
};
