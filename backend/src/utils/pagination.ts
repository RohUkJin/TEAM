import { AppError } from "./AppError";
import { requirePositiveInt } from "./validators";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export type PaginationQuery = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function parsePaginationQuery(value: unknown): PaginationQuery {
  const query =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const page =
    query.page === undefined || query.page === ""
      ? DEFAULT_PAGE
      : requirePositiveInt(query.page, "page");

  const limitRaw =
    query.limit === undefined || query.limit === ""
      ? DEFAULT_LIMIT
      : requirePositiveInt(query.limit, "limit");

  if (limitRaw > MAX_LIMIT) {
    throw AppError.validation(`limit must be <= ${MAX_LIMIT}`, {
      field: "limit",
      max: MAX_LIMIT,
    });
  }

  return {
    page,
    limit: limitRaw,
    offset: (page - 1) * limitRaw,
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
