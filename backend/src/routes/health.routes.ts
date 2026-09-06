import { Router } from "express";
import { healthController } from "../controllers/health.controller";
import { asyncHandler } from "../utils/asyncHandler";

const healthRoutes = Router();

healthRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    await healthController.getHealth(req, res);
  }),
);

export { healthRoutes };
