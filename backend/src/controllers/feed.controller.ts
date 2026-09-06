import { Request, Response } from "express";
import { feedService, type FeedPostSort } from "../services/feed.service";
import { AppError } from "../utils/AppError";
import { requirePositiveInt } from "../utils/validators";
import { sendOk } from "../utils/response";

const DEFAULT_POST_PAGE = 1;
const DEFAULT_POST_LIMIT = 9;
const MAX_POST_LIMIT = 50;

function parseSort(raw: unknown): FeedPostSort {
  return raw === "comments" ? "comments" : "views";
}

function parsePostPage(raw: unknown): number {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_POST_PAGE;
  return requirePositiveInt(raw, "page");
}

function parsePostLimit(raw: unknown): number {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_POST_LIMIT;
  const limit = requirePositiveInt(raw, "limit");
  if (limit > MAX_POST_LIMIT) {
    throw AppError.validation(`limit must be <= ${MAX_POST_LIMIT}`, {
      field: "limit",
      max: MAX_POST_LIMIT,
    });
  }
  return limit;
}

export class FeedController {
  async home(req: Request, res: Response): Promise<void> {
    const sort = parseSort(req.query.sort);
    const postPage = parsePostPage(req.query.page);
    const postLimit = parsePostLimit(req.query.limit);
    const feed = await feedService.getHomeFeed(req.user?.id, {
      sort,
      postPage,
      postLimit,
    });
    sendOk(res, feed);
  }
}

export const feedController = new FeedController();
