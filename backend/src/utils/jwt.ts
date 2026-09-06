import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./AppError";

export type AccessTokenPayload = {
  userId: string;
};

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresInSeconds,
  });
}

/**
 * Signature + expiration 을 포함한 JWT 검증.
 * jwt.verify 가 서명 불일치/만료/형식 오류를 모두 검사한다.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof (decoded as AccessTokenPayload).userId !== "string"
    ) {
      throw AppError.unauthorized("Invalid access token", "INVALID_TOKEN");
    }
    return { userId: (decoded as AccessTokenPayload).userId };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized("Access token has expired", "TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized("Invalid access token", "INVALID_TOKEN");
    }
    throw AppError.unauthorized("Invalid access token", "INVALID_TOKEN");
  }
}
