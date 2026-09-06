import { HttpStatus, HttpStatusCode } from "../constants/httpStatus";

export type ErrorDetails = unknown;

export class AppError extends Error {
  readonly statusCode: HttpStatusCode | number;
  readonly code: string;
  readonly details?: ErrorDetails;

  constructor(
    statusCode: HttpStatusCode | number,
    code: string,
    message: string,
    details?: ErrorDetails,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }

  static badRequest(message: string, details?: ErrorDetails, code = "BAD_REQUEST") {
    return new AppError(HttpStatus.BAD_REQUEST, code, message, details);
  }

  static unauthorized(message = "Authentication required", code = "UNAUTHORIZED") {
    return new AppError(HttpStatus.UNAUTHORIZED, code, message);
  }

  static forbidden(message = "Access denied", code = "FORBIDDEN") {
    return new AppError(HttpStatus.FORBIDDEN, code, message);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new AppError(HttpStatus.NOT_FOUND, code, message);
  }

  static conflict(message: string, code = "CONFLICT") {
    return new AppError(HttpStatus.CONFLICT, code, message);
  }

  static internal(message = "Unexpected server error", code = "INTERNAL_SERVER_ERROR") {
    return new AppError(HttpStatus.INTERNAL_SERVER_ERROR, code, message);
  }

  static validation(message: string, details?: ErrorDetails) {
    return new AppError(
      HttpStatus.BAD_REQUEST,
      "VALIDATION_ERROR",
      message,
      details,
    );
  }
}
