import { Router } from "express";
import { blogController } from "../controllers/blog.controller";
import { optionalAuth } from "../middleware/optionalAuth";
import { requireAuth } from "../middleware/requireAuth";
import { validateRequest } from "../middleware/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePaginationQuery } from "../utils/pagination";
import {
  parseBlogIdParam,
  parseCheckTeamNameQuery,
  parseCreateBlogBody,
  parseJoinBlogBody,
  parseListBlogsQuery,
  parseUpdateBlogBody,
} from "../validators/blog.validators";
import { parseCreatePostBody } from "../validators/postComment.validators";

const blogRoutes = Router();

blogRoutes.get(
  "/",
  optionalAuth,
  validateRequest({ query: parseListBlogsQuery }),
  asyncHandler(async (req, res) => {
    await blogController.list(req, res);
  }),
);

blogRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    await blogController.getMine(req, res);
  }),
);

blogRoutes.get(
  "/team-create-status",
  requireAuth,
  asyncHandler(async (req, res) => {
    await blogController.getTeamCreateStatus(req, res);
  }),
);

blogRoutes.get(
  "/check-name",
  requireAuth,
  validateRequest({ query: parseCheckTeamNameQuery }),
  asyncHandler(async (req, res) => {
    await blogController.checkTeamName(req, res);
  }),
);

blogRoutes.get(
  "/resolve",
  optionalAuth,
  asyncHandler(async (req, res) => {
    await blogController.resolve(req, res);
  }),
);

blogRoutes.post(
  "/",
  requireAuth,
  validateRequest({ body: parseCreateBlogBody }),
  asyncHandler(async (req, res) => {
    await blogController.create(req, res);
  }),
);

blogRoutes.patch(
  "/:blogId",
  requireAuth,
  validateRequest({
    params: parseBlogIdParam,
    body: parseUpdateBlogBody,
  }),
  asyncHandler(async (req, res) => {
    await blogController.update(req, res);
  }),
);

blogRoutes.get(
  "/:blogId/meta",
  optionalAuth,
  validateRequest({ params: parseBlogIdParam }),
  asyncHandler(async (req, res) => {
    await blogController.getMeta(req, res);
  }),
);

blogRoutes.get(
  "/:blogId/posts",
  optionalAuth,
  validateRequest({
    params: parseBlogIdParam,
    query: parsePaginationQuery,
  }),
  asyncHandler(async (req, res) => {
    await blogController.listPosts(req, res);
  }),
);

blogRoutes.post(
  "/:blogId/posts",
  requireAuth,
  validateRequest({
    params: parseBlogIdParam,
    body: parseCreatePostBody,
  }),
  asyncHandler(async (req, res) => {
    await blogController.createPost(req, res);
  }),
);

blogRoutes.post(
  "/:blogId/join",
  requireAuth,
  validateRequest({
    params: parseBlogIdParam,
    body: parseJoinBlogBody,
  }),
  asyncHandler(async (req, res) => {
    await blogController.join(req, res);
  }),
);

blogRoutes.post(
  "/:blogId/invites",
  requireAuth,
  validateRequest({ params: parseBlogIdParam }),
  asyncHandler(async (req, res) => {
    await blogController.createInvite(req, res);
  }),
);

blogRoutes.get(
  "/:blogId",
  optionalAuth,
  validateRequest({ params: parseBlogIdParam }),
  asyncHandler(async (req, res) => {
    await blogController.getById(req, res);
  }),
);

export { blogRoutes };
