import { NextFunction, Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE } from "../config/authCookie";
import { userRepository } from "../repositories/user.repository";
import { PublicUser, toPublicUser } from "../types/user";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyAccessToken } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    /** requireAuth 통과 후 설정되는 인증 사용자 (password_hash 없음) */
    user?: PublicUser;
  }
}

/**
 * Authentication middleware.
 *
 * Request → Cookie → JWT 추출 → signature/exp 검증 → userId → DB user → req.user
 */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

    if (typeof token !== "string" || token.length === 0) {
      throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
    }

    // jwt.verify: signature + expiration 검증 (존재 여부만 보지 않음)
    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw AppError.unauthorized(
        "Authenticated user no longer exists",
        "USER_NOT_FOUND",
      );
    }

    req.user = toPublicUser(user);
    next();
  },
);
