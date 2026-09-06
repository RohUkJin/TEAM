import { ApiError, getUserFacingMessage, toApiError } from "./errors";
import type { PaginatedResult } from "./types";

type QueryValue = string | number | boolean | undefined | null;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** 기본 true — Cookie(access_token) cross-origin 전송에 필요 */
  credentials?: RequestCredentials;
  /**
   * true면 401 시 auth 초기화/로그인 이동을 하지 않음.
   * /auth/me, /auth/login 처럼 401이 정상 흐름인 호출에 사용.
   */
  skipUnauthorizedHandling?: boolean;
  /** 내부용: refresh 후 재시도 여부 */
  _retriedAfterRefresh?: boolean;
};

type UnauthorizedHandler = (error: ApiError) => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/** AuthProvider 등에서 한 번 등록: clearSession + login 이동 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local.",
    );
  }
  return base.replace(/\/$/, "");
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getBaseUrl()}${normalized}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // HTML/스택 등 원문을 message에 넣지 않음
    return {
      error: {
        code: "INVALID_JSON",
        message: "Invalid response from server",
      },
    };
  }
}

const NO_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-email",
]);

/** 동시 401에 refresh는 한 번만 */
let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(buildUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/**
 * 공통 API Client
 * - base URL / credentials / JSON
 * - 401 → refresh 1회 시도 후 재요청
 * - 그래도 401 → auth 초기화 + 로그인 이동 (옵션으로 제외 가능)
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    signal,
    credentials = "include",
    skipUnauthorizedHandling = false,
    _retriedAfterRefresh = false,
  } = options;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  let serialized: string | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    serialized = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      credentials,
      headers,
      body: serialized,
      signal,
    });
  } catch {
    throw new ApiError(
      500,
      "NETWORK_ERROR",
      "A server error occurred. Please try again later.",
    );
  }

  const payload = await parseJsonSafe(res);

  if (!res.ok) {
    const error = toApiError(res.status, payload);
    if (
      error.isUnauthorized &&
      !_retriedAfterRefresh &&
      !NO_REFRESH_PATHS.has(path)
    ) {
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        return apiRequest<T>(path, {
          ...options,
          _retriedAfterRefresh: true,
        });
      }
    }
    if (error.isUnauthorized && !skipUnauthorizedHandling) {
      unauthorizedHandler?.(error);
    }
    throw error;
  }

  return payload as T;
}

/** `{ data: T }` envelope에서 data만 반환 */
export async function apiData<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const payload = await apiRequest<{ data: T }>(path, options);
  if (payload == null || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiError(500, "INVALID_RESPONSE", "Missing data in response");
  }
  return payload.data;
}

/** `{ data, pagination }` paginated envelope */
export async function apiPaginated<T>(
  path: string,
  options?: RequestOptions,
): Promise<PaginatedResult<T>> {
  const payload = await apiRequest<PaginatedResult<T>>(path, options);
  if (
    payload == null ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !("pagination" in payload)
  ) {
    throw new ApiError(
      500,
      "INVALID_RESPONSE",
      "Missing paginated fields in response",
    );
  }
  return { data: payload.data, pagination: payload.pagination };
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiData<T>(path, { ...options, method: "GET" }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiData<T>(path, { ...options, method: "POST", body }),

  put: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiData<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiData<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiData<T>(path, { ...options, method: "DELETE" }),

  getPaginated: <T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => apiPaginated<T>(path, { ...options, method: "GET" }),
};

export { getUserFacingMessage };
