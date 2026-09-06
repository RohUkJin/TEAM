import { apiClient } from "@/lib/api";
import type { Blog, Pagination, Post } from "@/lib/api";

export type FeedPostSort = "views" | "comments";

export type FeedPeriod = {
  year: number;
  month: number;
};

export type HomeFeed = {
  popularPosts: Post[];
  popularTeams: Blog[];
  sort: FeedPostSort;
  period: FeedPeriod;
  popularPostsPagination: Pagination;
};

export type GetHomeFeedQuery = {
  sort?: FeedPostSort;
  page?: number;
  limit?: number;
};

export const feedService = {
  async getHome(query: GetHomeFeedQuery = {}): Promise<HomeFeed> {
    return apiClient.get<HomeFeed>("/feed/home", {
      query: {
        sort: query.sort ?? "views",
        page: query.page,
        limit: query.limit,
      },
    });
  },
};
