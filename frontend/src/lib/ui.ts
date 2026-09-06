import { ApiError, getUserFacingMessage } from "@/lib/api";

export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
}

/** 목록용 본문 미리보기 */
export function excerpt(text: string, maxLength = 140): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

/** 상태코드별 안전한 UI 메시지 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return getUserFacingMessage(err);
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export function getErrorTitle(err: unknown): string {
  if (!(err instanceof ApiError)) return "오류";
  if (err.isValidation) return "잘못된 요청";
  if (err.isUnauthorized) return "로그인이 필요합니다";
  if (err.isForbidden) return "권한이 없습니다";
  if (err.isNotFound) return "찾을 수 없습니다";
  if (err.isConflict) return "충돌이 발생했습니다";
  if (err.isServerError) return "서버 오류";
  return "오류";
}
