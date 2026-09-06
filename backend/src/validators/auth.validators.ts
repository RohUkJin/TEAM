import { AppError } from "../utils/AppError";
import {
  assertValidNickname,
  assertValidUrlSlug,
} from "../utils/slug";
import { requireString } from "../utils/validators";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export type RegisterBody = {
  email: string;
  password: string;
  nickname: string;
  /** 선택: 미입력 시 영문 닉네임 재사용 또는 user{id} */
  urlSlug?: string;
};

function assertValidPassword(password: unknown): string {
  if (typeof password !== "string") {
    throw AppError.validation("password must be a string", { field: "password" });
  }
  // password는 trim하지 않는다. 공백이 의도된 문자일 수 있음.
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw AppError.validation(
      `password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      { field: "password", minLength: PASSWORD_MIN_LENGTH },
    );
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    // bcrypt는 72바이트 이후를 무시하므로 상한을 둔다.
    throw AppError.validation("password is too long", {
      field: "password",
      maxLength: PASSWORD_MAX_LENGTH,
    });
  }
  if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    throw AppError.validation(
      "password must include at least one letter and one number",
      { field: "password" },
    );
  }
  return password;
}

export function parseRegisterBody(value: unknown): RegisterBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["email", "password", "nickname"],
    });
  }

  const body = value as Record<string, unknown>;

  if (!("email" in body) || !("password" in body) || !("nickname" in body)) {
    throw AppError.validation("email, password and nickname are required", {
      fields: ["email", "password", "nickname"],
    });
  }

  const email = requireString(body.email, "email", { maxLength: 255 }).toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw AppError.validation("email format is invalid", { field: "email" });
  }

  const password = assertValidPassword(body.password);

  let nickname: string;
  try {
    nickname = assertValidNickname(
      requireString(body.nickname, "nickname", { maxLength: 32 }),
    );
  } catch (err) {
    throw AppError.validation(
      err instanceof Error ? err.message : "nickname is invalid",
      { field: "nickname" },
    );
  }

  let urlSlug: string | undefined;
  if (
    "urlSlug" in body &&
    body.urlSlug !== undefined &&
    body.urlSlug !== null &&
    String(body.urlSlug).trim() !== ""
  ) {
    try {
      urlSlug = assertValidUrlSlug(
        requireString(body.urlSlug, "urlSlug", { maxLength: 32 }),
      );
    } catch (err) {
      throw AppError.validation(
        err instanceof Error ? err.message : "urlSlug is invalid",
        { field: "urlSlug" },
      );
    }
  }

  return {
    email,
    password,
    nickname,
    urlSlug,
  };
}

export type VerifyEmailBody = {
  token: string;
};

export function parseVerifyEmailBody(value: unknown): VerifyEmailBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["token"],
    });
  }

  const body = value as Record<string, unknown>;
  const token = requireString(body.token, "token", { maxLength: 256 });

  return { token };
}

export type LoginBody = {
  email: string;
  password: string;
};

export function parseLoginBody(value: unknown): LoginBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw AppError.validation("Request body must be a JSON object", {
      fields: ["email", "password"],
    });
  }

  const body = value as Record<string, unknown>;

  if (!("email" in body) || !("password" in body)) {
    throw AppError.validation("email and password are required", {
      fields: ["email", "password"],
    });
  }

  const email = requireString(body.email, "email", { maxLength: 255 }).toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw AppError.validation("email format is invalid", { field: "email" });
  }

  if (typeof body.password !== "string" || body.password.length === 0) {
    throw AppError.validation("password is required", { field: "password" });
  }

  return {
    email,
    password: body.password,
  };
}
