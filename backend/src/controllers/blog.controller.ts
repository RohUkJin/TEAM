import { Request, Response } from "express";
import { blogService } from "../services/blog.service";
import { postService } from "../services/post.service";
import { AppError } from "../utils/AppError";
import { PaginationQuery } from "../utils/pagination";
import { sendCreated, sendOk, sendPaginated } from "../utils/response";
import {
  BlogIdParam,
  CreateBlogBody,
  CheckTeamNameQuery,
  JoinBlogBody,
  ListBlogsQuery,
  UpdateBlogBody,
} from "../validators/blog.validators";
import { CreatePostBody } from "../validators/postComment.validators";

export class BlogController {
  async list(req: Request, res: Response): Promise<void> {
    const query = req.validated?.query as ListBlogsQuery;
    const result = await blogService.list(query, req.user?.id);
    sendPaginated(res, result.blogs, result.pagination);
  }

  async getMine(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const blog = await blogService.getMine(req.user.id);
    sendOk(res, { blog });
  }

  async getTeamCreateStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const status = await blogService.getTeamCreateStatus(req.user.id);
    sendOk(res, { status });
  }

  async checkTeamName(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const query = req.validated?.query as CheckTeamNameQuery;
    const result = await blogService.checkTeamName(query.name);
    sendOk(res, result);
  }

  async resolve(req: Request, res: Response): Promise<void> {
    const query = req.query as {
      kind?: string;
      urlSlug?: string;
      /** @deprecated use urlSlug — vanity path owner segment */
      nickname?: string;
      slug?: string;
    };
    if (query.kind === "personal") {
      const ownerSlug = query.urlSlug || query.nickname;
      if (!ownerSlug || !query.slug) {
        throw AppError.validation("urlSlug and slug are required");
      }
      const blog = await blogService.resolvePersonal(
        String(ownerSlug),
        String(query.slug),
        req.user?.id,
      );
      sendOk(res, { blog });
      return;
    }
    if (query.kind === "team") {
      if (!query.slug) {
        throw AppError.validation("slug is required");
      }
      const blog = await blogService.resolveTeam(
        String(query.slug),
        req.user?.id,
      );
      sendOk(res, { blog });
      return;
    }
    throw AppError.validation("kind must be personal or team");
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const body = req.validated?.body as CreateBlogBody;
    const blog = await blogService.create(req.user.id, body);
    sendCreated(res, { blog });
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const params = req.validated?.params as BlogIdParam;
    const body = req.validated?.body as UpdateBlogBody;
    const blog = await blogService.update(params.blogId, req.user.id, body);
    sendOk(res, { blog });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const params = req.validated?.params as BlogIdParam;
    const blog = await blogService.getById(params.blogId, req.user?.id);
    sendOk(res, { blog });
  }

  /** 잠금 상태 확인용 — 팀도 메타 반환 */
  async getMeta(req: Request, res: Response): Promise<void> {
    const params = req.validated?.params as BlogIdParam;
    const blog = await blogService.getPublicMeta(params.blogId, req.user?.id);
    sendOk(res, { blog });
  }

  async join(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const params = req.validated?.params as BlogIdParam;
    const body = req.validated?.body as JoinBlogBody;
    const blog = await blogService.join(params.blogId, req.user.id, body);
    sendOk(res, { blog });
  }

  async createInvite(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const params = req.validated?.params as BlogIdParam;
    const result = await blogService.createInvite(params.blogId, req.user.id);
    sendCreated(res, result);
  }

  async listPosts(req: Request, res: Response): Promise<void> {
    const params = req.validated?.params as BlogIdParam;
    const pagination = req.validated?.query as PaginationQuery;
    const result = await postService.listByBlog(
      params.blogId,
      pagination,
      req.user?.id,
    );
    sendPaginated(res, result.posts, result.pagination);
  }

  async createPost(req: Request, res: Response): Promise<void> {
    if (!req.user) throw AppError.unauthorized();
    const params = req.validated?.params as BlogIdParam;
    const body = req.validated?.body as CreatePostBody;
    const post = await postService.createInBlog(
      req.user.id,
      params.blogId,
      body,
    );
    sendCreated(res, { post });
  }
}

export const blogController = new BlogController();
