import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validateRequest } from "../middleware/validateRequest";
import { asyncHandler } from "../utils/asyncHandler";
import {
  parseLoginBody,
  parseRegisterBody,
  parseVerifyEmailBody,
} from "../validators/auth.validators";

const authRoutes = Router();

authRoutes.post(
  "/register",
  validateRequest({ body: parseRegisterBody }),
  asyncHandler(async (req, res) => {
    await authController.register(req, res);
  }),
);

authRoutes.post(
  "/verify-email",
  validateRequest({ body: parseVerifyEmailBody }),
  asyncHandler(async (req, res) => {
    await authController.verifyEmail(req, res);
  }),
);

authRoutes.post(
  "/login",
  validateRequest({ body: parseLoginBody }),
  asyncHandler(async (req, res) => {
    await authController.login(req, res);
  }),
);

authRoutes.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    await authController.refresh(req, res);
  }),
);

authRoutes.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await authController.logout(req, res);
  }),
);

/** 인증 middleware 검증용 보호 API */
authRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    await authController.me(req, res);
  }),
);

export { authRoutes };
