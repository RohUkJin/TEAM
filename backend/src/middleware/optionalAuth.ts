import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE } from "../config/authCookie";
import { userRepository } from "../repositories/user.repository";
import { toPublicUser } from "../types/user";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyAccessToken } from "../utils/jwt";

/**
 * 쿠키 JWT가 있으면 req.user 설정, 없거나 유효하지 않으면 그냥 next.
 */
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (typeof token !== "string" || token.length === 0) {
      next();
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      const user = await userRepository.findById(payload.userId);
      if (user) {
        req.user = toPublicUser(user);
      }
    } catch {
      // optional: ignore invalid/expired token
    }

    next();
  },
);
