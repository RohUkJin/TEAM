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
  const byCode: Record<string, string> = {
    INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다",
    EMAIL_NOT_VERIFIED: "이메일 인증이 필요합니다",
    EMAIL_ALREADY_EXISTS: "이미 등록된 이메일입니다",
    NICKNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임입니다",
    URL_SLUG_ALREADY_EXISTS: "이미 사용 중인 URL입니다",
    TEAM_BLOG_WEEKLY_LIMIT: "팀 블로그는 주 1회만 만들 수 있습니다",
    TEAM_NAME_TAKEN: "이미 사용 중인 팀 이름입니다",
    INVITE_ALREADY_EXISTS:
      "아직 사용되지 않은 초대코드가 있습니다. 사용되거나 만료된 뒤 다시 발급해 주세요",
    INVITE_CREATE_FAILED: "초대코드 발급에 실패했습니다. 다시 시도해 주세요",
    INVITE_EXPIRED: "만료된 초대코드입니다",
    INVITE_ALREADY_USED: "이미 사용된 초대코드입니다",
    INVITE_INVALID: "초대코드가 올바르지 않습니다",
    NOT_BLOG_MEMBER: "이 작업을 수행할 권한이 없습니다",
    TEAM_BLOG_LOCKED: "팀 블로그는 멤버만 볼 수 있습니다",
  };

  if (byCode[error.code]) {
    return byCode[error.code];
  }

  switch (error.status) {
    case 400:
      return "요청 내용이 올바르지 않습니다";
    case 401:
      return "다시 로그인해 주세요";
    case 403:
      return "이 작업을 수행할 권한이 없습니다";
    case 404:
      return "요청한 항목을 찾을 수 없습니다";
    case 409:
      return "이미 존재하는 데이터와 충돌합니다";
    default:
      if (error.status >= 500) {
        return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요";
      }
      return "문제가 발생했습니다. 잠시 후 다시 시도해 주세요";
  }
}
