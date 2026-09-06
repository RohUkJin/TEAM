import { Router } from "express";
import { commentController } from "../controllers/comment.controller";
import { postController } from "../controllers/post.controller";
import { optionalAuth } from "../middleware/optionalAuth";
import { requireAuth } from "../middleware/requireAuth";
import { validateRequest } from "../middleware/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import {
  parseCreateCommentBody,
  parseCreatePostBody,
  parseIdParam,
  parsePostIdParam,
  parseUpdatePostBody,
} from "../validators/postComment.validators";
import { parsePaginationQuery } from "../utils/pagination";

const postRoutes = Router();

postRoutes.post(
  "/",
  requireAuth,
  validateRequest({ body: parseCreatePostBody }),
  asyncHandler(async (req, res) => {
    await postController.create(req, res);
  }),
);

postRoutes.get(
  "/",
  validateRequest({ query: parsePaginationQuery }),
  asyncHandler(async (req, res) => {
    await postController.list(req, res);
  }),
);

postRoutes.get(
  "/:postId/comments",
  optionalAuth,
  validateRequest({ params: parsePostIdParam }),
  asyncHandler(async (req, res) => {
    await commentController.listByPost(req, res);
  }),
);

postRoutes.post(
  "/:postId/comments",
  requireAuth,
  validateRequest({
    params: parsePostIdParam,
    body: parseCreateCommentBody,
  }),
  asyncHandler(async (req, res) => {
    await commentController.create(req, res);
  }),
);

postRoutes.get(
  "/:id",
  optionalAuth,
  validateRequest({ params: parseIdParam }),
  asyncHandler(async (req, res) => {
    await postController.getById(req, res);
  }),
);

postRoutes.put(
  "/:id",
  requireAuth,
  validateRequest({ params: parseIdParam, body: parseUpdatePostBody }),
  asyncHandler(async (req, res) => {
    await postController.update(req, res);
  }),
);

postRoutes.delete(
  "/:id",
  requireAuth,
  validateRequest({ params: parseIdParam }),
  asyncHandler(async (req, res) => {
    await postController.remove(req, res);
  }),
);

export { postRoutes };
