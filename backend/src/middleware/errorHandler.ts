import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/httpStatus";
import { AppError } from "../utils/AppError";

/**
 * Backend 공통 에러 응답
 *
 * | 분류            | HTTP | 대표 code              |
 * |-----------------|------|------------------------|
 * | Validation      | 400  | VALIDATION_ERROR       |
 * | Authentication  | 401  | UNAUTHORIZED / …       |
 * | Authorization   | 403  | FORBIDDEN              |
 * | Not Found       | 404  | NOT_FOUND              |
 * | Conflict        | 409  | CONFLICT / EMAIL_…     |
 * | Internal Error  | 500  | INTERNAL_SERVER_ERROR  |
 *
 * 클라이언트에는 stack / SQL / env / 비밀번호를 넣지 않는다.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    // 5xx AppError도 내부 메시지는 로그에만, 응답은 일반화
    if (err.statusCode >= 500) {
      console.error("[AppError 5xx]", err.code, err.message, err.details);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected server error",
        },
      });
      return;
    }

    const payload: {
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    } = {
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // details는 validation 필드 힌트 등 (비밀값 금지)
    if (err.details !== undefined) {
      payload.error.details = err.details;
    }

    res.status(err.statusCode).json(payload);
    return;
  }

  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as { status?: number }).status === 400
  ) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON",
      },
    });
    return;
  }

  console.error(err);

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
    },
  });
}
