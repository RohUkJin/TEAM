import { CookieOptions } from "express";
import { env } from "./env";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

/**
 * Access Token Cookie 보안 옵션.
 *
 * - HttpOnly: 항상 true (document.cookie로 JWT 읽기 불가)
 * - Secure / SameSite: 환경변수 또는 NODE_ENV 기본값
 * - Path: /
 * - Max-Age: access JWT 만료와 동일
 */
export function getAccessTokenCookieOptions(): CookieOptions {
  return buildCookieOptions(env.jwtExpiresInSeconds);
}

/** Refresh Token Cookie — access보다 길게, HttpOnly 동일 */
export function getRefreshTokenCookieOptions(): CookieOptions {
  return buildCookieOptions(env.refreshTokenExpiresInSeconds);
}

function buildCookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/",
    maxAge: maxAgeSeconds * 1000,
  };
}

export function clearAuthCookieOptions(): CookieOptions {
  const options = getAccessTokenCookieOptions();
  return {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  };
}

/** 설정 점검/로그용 요약 (토큰 값 자체는 포함하지 않음) */
export function getAccessTokenCookieSecuritySummary() {
  const options = getAccessTokenCookieOptions();
  return {
    name: ACCESS_TOKEN_COOKIE,
    httpOnly: options.httpOnly === true,
    secure: options.secure === true,
    sameSite: options.sameSite,
    path: options.path,
    maxAgeSeconds: env.jwtExpiresInSeconds,
    refreshMaxAgeSeconds: env.refreshTokenExpiresInSeconds,
    environment: env.nodeEnv,
  };
}
