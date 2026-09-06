/**
 * Backend 공통 에러 envelope와 맞춘 클라이언트 에러.
 * Component는 fetch Response를 직접 다루지 않고 이 타입으로 분기한다.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isValidation(): boolean {
    return this.status === 400;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

type BackendErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export function toApiError(status: number, body: unknown): ApiError {
  const parsed = body as BackendErrorBody;
  const code = parsed?.error?.code ?? "UNKNOWN_ERROR";
  const message =
    parsed?.error?.message ?? `Request failed with status ${status}`;
  return new ApiError(status, code, message, parsed?.error?.details);
}

/**
 * UI에 보여줄 안전한 메시지.
 * 500 등은 서버 원문을 그대로 노출하지 않는다.
 */
export function getUserFacingMessage(error: ApiError): string {
  if (error.code === "TEAM_BLOG_WEEKLY_LIMIT") {
    return "팀 블로그는 주 1회만 만들 수 있습니다";
  }
  if (error.code === "TEAM_NAME_TAKEN") {
    return "이미 사용 중인 팀 이름입니다";
  }
  if (error.code === "INVITE_ALREADY_EXISTS") {
    return "아직 사용되지 않은 초대코드가 있습니다. 사용되거나 만료된 뒤 다시 발급해 주세요";
  }
  if (error.code === "INVITE_CREATE_FAILED") {
    return "초대코드 발급에 실패했습니다. 다시 시도해 주세요";
  }
  if (error.code === "INVITE_EXPIRED") {
    return "만료된 초대코드입니다";
  }
  if (error.code === "INVITE_ALREADY_USED") {
    return "이미 사용된 초대코드입니다";
  }
  if (error.code === "INVITE_INVALID") {
    return "초대코드가 올바르지 않습니다";
  }

  switch (error.status) {
    case 400:
      return error.message || "Invalid request";
    case 401:
      return error.message || "Please sign in again";
    case 403:
      return error.message || "You do not have permission to do this";
    case 404:
      return error.message || "The requested resource was not found";
    case 409:
      return error.message || "This resource conflicts with existing data";
    default:
      if (error.status >= 500) {
        return "A server error occurred. Please try again later.";
      }
      return error.message || "Something went wrong";
  }
}
