import bcrypt from "bcrypt";
import crypto from "crypto";
import { DatabaseError } from "pg";
import { env } from "../config/env";
import { emailVerificationRepository } from "../repositories/emailVerification.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { userRepository } from "../repositories/user.repository";
import { PublicUser, toPublicUser } from "../types/user";
import { AppError } from "../utils/AppError";
import {
  isAsciiUrlSlugCandidate,
  isReservedPathSegment,
  normalizeUrlSlug,
} from "../utils/slug";
import {
  generateVerificationToken,
  hashVerificationToken,
} from "../utils/token";
import {
  RegisterBody,
  VerifyEmailBody,
  LoginBody,
} from "../validators/auth.validators";
import { blogService } from "./blog.service";
import { emailSender } from "./emailSender";
import { signAccessToken } from "../utils/jwt";

const BCRYPT_SALT_ROUNDS = 10;

export type RegisterResult = {
  user: PublicUser;
  /** console 메일 전송 시에만 포함 */
  devVerificationToken?: string;
};

export type VerifyEmailResult = {
  user: PublicUser;
  alreadyVerified: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResult = {
  user: PublicUser;
} & AuthTokens;

export type RefreshResult = {
  user: PublicUser;
} & AuthTokens;

export class AuthService {
  async register(input: RegisterBody): Promise<RegisterResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("Email is already registered", "EMAIL_ALREADY_EXISTS");
    }

    const nickTaken = await userRepository.findByNickname(input.nickname);
    if (nickTaken) {
      throw AppError.conflict("Nickname is already taken", "NICKNAME_ALREADY_EXISTS");
    }

    let chosenSlug = input.urlSlug ?? null;
    if (chosenSlug) {
      const slugTaken = await userRepository.findByUrlSlug(chosenSlug);
      if (slugTaken) {
        throw AppError.conflict("URL slug is already taken", "URL_SLUG_ALREADY_EXISTS");
      }
    } else if (isAsciiUrlSlugCandidate(input.nickname)) {
      const candidate = normalizeUrlSlug(input.nickname);
      if (
        !isReservedPathSegment(candidate) &&
        !(await userRepository.findByUrlSlug(candidate))
      ) {
        chosenSlug = candidate;
      }
    }

    const provisionalSlug =
      chosenSlug ?? `tmp_${crypto.randomBytes(8).toString("hex")}`;

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    let created;
    try {
      created = await userRepository.createUser({
        email: input.email,
        passwordHash,
        nickname: input.nickname,
        urlSlug: provisionalSlug,
        emailVerified: false,
      });
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        throw AppError.conflict(
          "Email, nickname or URL slug already registered",
          "EMAIL_ALREADY_EXISTS",
        );
      }
      throw error;
    }

    if (!chosenSlug) {
      const fallback = `user${created.id}`;
      const updated = await userRepository.updateUrlSlug(created.id, fallback);
      if (updated) created = updated;
    }

    const rawToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(rawToken);
    const expiresAt = new Date(
      Date.now() + env.emailVerificationExpiresHours * 60 * 60 * 1000,
    );

    await emailVerificationRepository.invalidateUnusedTokensForUser(created.id);
    await emailVerificationRepository.createToken({
      userId: created.id,
      tokenHash,
      expiresAt,
    });

    await emailSender.sendVerificationEmail({
      to: created.email,
      verificationToken: rawToken,
      verifyPath: `${env.frontendOrigin}/verify-email`,
    });

    const result: RegisterResult = {
      user: toPublicUser(created),
    };

    if (env.exposeDevVerificationToken) {
      result.devVerificationToken = rawToken;
    }

    return result;
  }

  async verifyEmail(input: VerifyEmailBody): Promise<VerifyEmailResult> {
    const tokenHash = hashVerificationToken(input.token);
    const record = await emailVerificationRepository.findByTokenHash(tokenHash);

    if (!record) {
      throw AppError.badRequest("Verification token is invalid", undefined, "TOKEN_INVALID");
    }

    if (record.used_at) {
      throw AppError.badRequest(
        "Verification token has already been used",
        undefined,
        "TOKEN_ALREADY_USED",
      );
    }

    if (record.expires_at.getTime() <= Date.now()) {
      throw AppError.badRequest(
        "Verification token has expired",
        undefined,
        "TOKEN_EXPIRED",
      );
    }

    const user = await userRepository.findById(record.user_id);
    if (!user) {
      throw AppError.badRequest("Verification token is invalid", undefined, "TOKEN_INVALID");
    }

    if (user.email_verified) {
      await emailVerificationRepository.markUsed(record.id);
      await blogService.ensurePersonalBlog(user.id, user.email);
      return {
        user: toPublicUser(user),
        alreadyVerified: true,
      };
    }

    const updated = await userRepository.markEmailVerified(user.id);
    if (!updated) {
      throw AppError.internal("Failed to verify email");
    }

    await emailVerificationRepository.markUsed(record.id);
    await blogService.ensurePersonalBlog(updated.id, updated.email);

    return {
      user: toPublicUser(updated),
      alreadyVerified: false,
    };
  }

  async login(input: LoginBody): Promise<LoginResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    if (!user.email_verified) {
      throw AppError.forbidden(
        "Email is not verified",
        "EMAIL_NOT_VERIFIED",
      );
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.password_hash,
    );
    if (!passwordMatches) {
      throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
    }

    await blogService.ensurePersonalBlog(user.id, user.email);

    const tokens = await this.issueTokenPair(user.id);

    return {
      user: toPublicUser(user),
      ...tokens,
    };
  }

  /** refresh 쿠키로 access(+refresh 로테이션) 재발급 */
  async refresh(rawRefreshToken: string | undefined): Promise<RefreshResult> {
    if (!rawRefreshToken) {
      throw AppError.unauthorized("Refresh token required", "UNAUTHORIZED");
    }

    const tokenHash = hashVerificationToken(rawRefreshToken);
    const stored = await refreshTokenRepository.findByHash(tokenHash);
    if (!stored) {
      throw AppError.unauthorized("Invalid refresh token", "INVALID_TOKEN");
    }

    // 이미 revoke된 refresh 재사용 = 탈취 의심 → 해당 유저 세션 전부 폐기
    if (stored.revoked_at) {
      await refreshTokenRepository.revokeAllForUser(stored.user_id);
      throw AppError.unauthorized(
        "Refresh token reuse detected",
        "TOKEN_REUSE",
      );
    }

    if (stored.expires_at.getTime() <= Date.now()) {
      throw AppError.unauthorized("Refresh token has expired", "TOKEN_EXPIRED");
    }

    const user = await userRepository.findById(stored.user_id);
    if (!user || !user.email_verified) {
      await refreshTokenRepository.revokeAllForUser(stored.user_id);
      throw AppError.unauthorized("Invalid refresh token", "INVALID_TOKEN");
    }

    // 로테이션: 기존 refresh 폐기 후 새 페어 발급
    await refreshTokenRepository.revokeByHash(tokenHash);
    const tokens = await this.issueTokenPair(user.id);

    return {
      user: toPublicUser(user),
      ...tokens,
    };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    const tokenHash = hashVerificationToken(rawRefreshToken);
    await refreshTokenRepository.revokeByHash(tokenHash);
  }

  private async issueTokenPair(userId: string): Promise<AuthTokens> {
    const accessToken = signAccessToken(userId);
    const refreshToken = generateVerificationToken();
    const tokenHash = hashVerificationToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + env.refreshTokenExpiresInSeconds * 1000,
    );

    await refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
