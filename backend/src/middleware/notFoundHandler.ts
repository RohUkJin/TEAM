import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound("Resource not found"));
}
