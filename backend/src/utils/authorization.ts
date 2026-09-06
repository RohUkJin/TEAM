import { AppError } from "./AppError";

/**
 * Authorization: 인증된 사용자가 리소스 소유자인지 검사한다.
 * Frontend 숨김/비활성만으로 권한을 판단하지 않는다.
 *
 * authenticatedUser.id  vs  resource.user_id
 */
export function assertResourceOwner(
  authenticatedUserId: string,
  resourceOwnerId: string,
  message = "You do not have permission to access this resource",
): void {
  if (String(authenticatedUserId) !== String(resourceOwnerId)) {
    throw AppError.forbidden(message, "FORBIDDEN");
  }
}
