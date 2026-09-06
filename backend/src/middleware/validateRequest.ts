import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export type RequestValidator<T> = (value: unknown) => T;

export type ValidateRequestOptions = {
  body?: RequestValidator<unknown>;
  query?: RequestValidator<unknown>;
  params?: RequestValidator<unknown>;
};

declare module "express-serve-static-core" {
  interface Request {
    validated?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}

/**
 * Route에 붙여 쓰는 request validation 구조.
 * 실패 시 AppError(400 VALIDATION_ERROR)를 throw → 전역 error middleware가 처리.
 */
export function validateRequest(options: ValidateRequestOptions) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validated = {};

      if (options.params) {
        req.validated.params = options.params(req.params);
      }
      if (options.query) {
        req.validated.query = options.query(req.query);
      }
      if (options.body) {
        req.validated.body = options.body(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }

      next(
        AppError.validation("Request validation failed", {
          reason: error instanceof Error ? error.message : "unknown",
        }),
      );
    }
  };
}
