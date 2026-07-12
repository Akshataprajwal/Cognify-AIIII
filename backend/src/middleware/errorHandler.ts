import type { NextFunction, Request, Response } from "express";

/**
 * Global centralized error handler.
 * - Prevents raw internal database/system stack traces from leaking to clients.
 * - Standardizes error signatures to follow: { success, error, code }.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const message = err instanceof Error ? err.message : "Internal server error";

  res.status(500).json({
    success: false,
    error: message,
    code: "INTERNAL_SERVER_ERROR",
  });
}
