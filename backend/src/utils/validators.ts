/**
 * 공통 validation helper.
 * 도메인별 validator는 이후 auth/posts 단계에서 이 패턴으로 추가한다.
 */
import { AppError } from "../utils/AppError";

export function requireString(
  value: unknown,
  field: string,
  options?: { minLength?: number; maxLength?: number },
): string {
  if (typeof value !== "string") {
    throw AppError.validation(`${field} must be a string`, { field });
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw AppError.validation(`${field} is required`, { field });
  }

  if (options?.minLength !== undefined && trimmed.length < options.minLength) {
    throw AppError.validation(`${field} is too short`, {
      field,
      minLength: options.minLength,
    });
  }

  if (options?.maxLength !== undefined && trimmed.length > options.maxLength) {
    throw AppError.validation(`${field} is too long`, {
      field,
      maxLength: options.maxLength,
    });
  }

  return trimmed;
}

export function requirePositiveInt(value: unknown, field: string): number {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(num) || (num as number) < 1) {
    throw AppError.validation(`${field} must be a positive integer`, { field });
  }
  return num as number;
}
