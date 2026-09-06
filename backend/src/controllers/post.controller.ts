import { Request, Response } from "express";
import { postService } from "../services/post.service";
import { AppError } from "../utils/AppError";
import { getClientIp } from "../utils/clientIp";
import { PaginationQuery } from "../utils/pagination";
import { sendCreated, sendOk, sendPaginated } from "../utils/response";
import {
  CreatePostBody,
  IdParam,
  UpdatePostBody,
} from "../validators/postComment.validators";

export class PostController {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const body = req.validated?.body as CreatePostBody;
    const post = await postService.create(req.user.id, body);
    sendCreated(res, { post });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const params = req.validated?.params as IdParam;
    const post = await postService.getById(
      params.id,
      req.user?.id,
      getClientIp(req),
    );
    sendOk(res, { post });
  }

  async list(req: Request, res: Response): Promise<void> {
    const pagination = req.validated?.query as PaginationQuery;
    const result = await postService.list(pagination);
    sendPaginated(res, result.posts, result.pagination);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const params = req.validated?.params as IdParam;
    const body = req.validated?.body as UpdatePostBody;
    const post = await postService.update(req.user.id, params.id, body);
    sendOk(res, { post });
  }

  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const params = req.validated?.params as IdParam;
    await postService.delete(req.user.id, params.id);
    sendOk(res, { deleted: true });
  }
}

export const postController = new PostController();
