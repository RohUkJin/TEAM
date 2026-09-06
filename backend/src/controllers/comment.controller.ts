import { Request, Response } from "express";
import { commentService } from "../services/comment.service";
import { AppError } from "../utils/AppError";
import { sendCreated, sendOk } from "../utils/response";
import {
  CommentIdParam,
  CreateCommentBody,
  PostIdParam,
  UpdateCommentBody,
} from "../validators/postComment.validators";

export class CommentController {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const params = req.validated?.params as PostIdParam;
    const body = req.validated?.body as CreateCommentBody;
    const comment = await commentService.create(req.user.id, params.postId, body);
    sendCreated(res, { comment });
  }

  async listByPost(req: Request, res: Response): Promise<void> {
    const params = req.validated?.params as PostIdParam;
    const comments = await commentService.listByPostId(
      params.postId,
      req.user?.id,
    );
    sendOk(res, { comments });
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const params = req.validated?.params as CommentIdParam;
    const body = req.validated?.body as UpdateCommentBody;
    const comment = await commentService.update(
      req.user.id,
      params.commentId,
      body,
    );
    sendOk(res, { comment });
  }

  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    const params = req.validated?.params as CommentIdParam;
    await commentService.delete(req.user.id, params.commentId);
    sendOk(res, { deleted: true });
  }
}

export const commentController = new CommentController();
