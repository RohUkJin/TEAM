import { Response } from "express";
import { HttpStatus } from "../constants/httpStatus";
import { PaginationMeta } from "./pagination";

export function sendOk<T>(res: Response, data: T, statusCode: number = HttpStatus.OK) {
  return res.status(statusCode).json({ data });
}

export function sendCreated<T>(res: Response, data: T) {
  return res.status(HttpStatus.CREATED).json({ data });
}

/** 목록 + pagination 메타 응답 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
) {
  return res.status(HttpStatus.OK).json({ data, pagination });
}
