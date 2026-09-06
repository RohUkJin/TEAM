import { Router } from "express";
import { feedController } from "../controllers/feed.controller";
import { optionalAuth } from "../middleware/optionalAuth";
import { asyncHandler } from "../utils/asyncHandler";

const feedRoutes = Router();

feedRoutes.get(
  "/home",
  optionalAuth,
  asyncHandler(async (req, res) => {
    await feedController.home(req, res);
  }),
);

export { feedRoutes };
