import { apiClient } from "@/lib/api";
import type { User } from "@/lib/api";

export type RegisterInput = {
  email: string;
  password: string;
  nickname: string;
  urlSlug?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterResult = {
  user: User;
  /** development 환경에서만 포함될 수 있음 */
  devVerificationToken?: string;
};

export type VerifyEmailResult = {
  user: User;
  alreadyVerified: boolean;
};

export type AuthUserResult = {
  user: User;
};

/**
 * Auth domain API — Component는 URL/fetch를 모르고 이 함수만 호출한다.
 */
export const authService = {
  register(input: RegisterInput): Promise<RegisterResult> {
    return apiClient.post<RegisterResult>("/auth/register", input);
  },

  verifyEmail(token: string): Promise<VerifyEmailResult> {
    return apiClient.post<VerifyEmailResult>("/auth/verify-email", { token });
  },

  /** Set-Cookie(access_token + refresh_token) — credentials: include 필수 */
  login(input: LoginInput): Promise<AuthUserResult> {
    return apiClient.post<AuthUserResult>("/auth/login", input, {
      skipUnauthorizedHandling: true,
    });
  },

  /** refresh_token 쿠키로 access 재발급 (+ refresh 로테이션) */
  refresh(): Promise<AuthUserResult> {
    return apiClient.post<AuthUserResult>("/auth/refresh", undefined, {
      skipUnauthorizedHandling: true,
    });
  },

  logout(): Promise<{ loggedOut: boolean }> {
    return apiClient.post<{ loggedOut: boolean }>("/auth/logout", undefined, {
      skipUnauthorizedHandling: true,
    });
  },

  me(): Promise<AuthUserResult> {
    return apiClient.get<AuthUserResult>("/auth/me", {
      skipUnauthorizedHandling: true,
    });
  },
};
