import { Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookieOptions,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../config/authCookie";
import { HttpStatus } from "../constants/httpStatus";
import { authService } from "../services/auth.service";
import { PublicUser } from "../types/user";
import { AppError } from "../utils/AppError";
import { sendCreated, sendOk } from "../utils/response";
import {
  LoginBody,
  RegisterBody,
  VerifyEmailBody,
} from "../validators/auth.validators";

function publicUserPayload(user: PublicUser) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    urlSlug: user.urlSlug,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    getAccessTokenCookieOptions(),
  );
  res.cookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    getRefreshTokenCookieOptions(),
  );
}

function clearAuthCookies(res: Response): void {
  const options = clearAuthCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE, options);
}

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const body = req.validated?.body as RegisterBody;
    const result = await authService.register(body);

    const payload: {
      user: ReturnType<typeof publicUserPayload>;
      devVerificationToken?: string;
    } = {
      user: publicUserPayload(result.user),
    };

    if (result.devVerificationToken) {
      payload.devVerificationToken = result.devVerificationToken;
    }

    sendCreated(res, payload);
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const body = req.validated?.body as VerifyEmailBody;
    const result = await authService.verifyEmail(body);

    sendOk(
      res,
      {
        user: publicUserPayload(result.user),
        alreadyVerified: result.alreadyVerified,
      },
      HttpStatus.OK,
    );
  }

  async login(req: Request, res: Response): Promise<void> {
    const body = req.validated?.body as LoginBody;
    const result = await authService.login(body);

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    sendOk(res, {
      user: publicUserPayload(result.user),
    });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const raw = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    const result = await authService.refresh(raw);

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    sendOk(res, {
      user: publicUserPayload(result.user),
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const raw = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    await authService.logout(raw);
    clearAuthCookies(res);
    sendOk(res, { loggedOut: true });
  }

  /** requireAuth 검증용 보호 API */
  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw AppError.unauthorized("Authentication required", "UNAUTHORIZED");
    }

    sendOk(res, {
      user: publicUserPayload(req.user),
    });
  }
}

export const authController = new AuthController();
