import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticate";
import { UserRepository } from "../repositories/userRepository";

/**
 * Admin role check middleware.
 * - Validates role === "ADMIN" via the abstraction layer.
 * - Standardizes error signatures to follow: { success, error, code }.
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized access: Session missing",
        code: "UNAUTHORIZED",
      });
      return;
    }

    // Load user role via UserRepository (supports DB + memory fallbacks safely)
    const user = await UserRepository.findById(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User account not found",
        code: "USER_NOT_FOUND",
      });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        error: "Access denied: Admin credentials required",
        code: "FORBIDDEN",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("[AdminAuth] Error checking admin status:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during role validation",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
