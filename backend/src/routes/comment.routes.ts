import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validateRequest } from "../middleware/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import {
  parseCommentIdParam,
  parseUpdateCommentBody,
} from "../validators/postComment.validators";

const commentRoutes = Router();

commentRoutes.put(
  "/:commentId",
  requireAuth,
  validateRequest({
    params: parseCommentIdParam,
    body: parseUpdateCommentBody,
  }),
  asyncHandler(async (req, res) => {
    await commentController.update(req, res);
  }),
);

commentRoutes.delete(
  "/:commentId",
  requireAuth,
  validateRequest({ params: parseCommentIdParam }),
  asyncHandler(async (req, res) => {
    await commentController.remove(req, res);
  }),
);

export { commentRoutes };
