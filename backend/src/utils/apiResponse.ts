import { Response } from "express";

export interface ApiResponseSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiResponseError {
  success: false;
  error: string;
  code: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;

export function sendSuccess<T>(
  res: Response,
  payload: T,
  status = 200
) {
  return res.status(status).json({ success: true, data: payload });
}

export function sendError(
  res: Response,
  error: string,
  code: string,
  status = 500,
  details?: unknown
) {
  const payload: ApiResponseError = {
    success: false,
    error,
    code,
  };

  if (details !== undefined) {
    payload.details = details;
  }

  return res.status(status).json(payload);
}

export function isDbConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const anyErr = error as { name?: string; message?: string };
  return (
    anyErr.name === "PrismaClientInitializationError" ||
    (typeof anyErr.message === "string" &&
      /(can't reach database server|can't connect|connection refused|ECONNREFUSED|ENOTFOUND)/i.test(anyErr.message))
  );
}
