import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { UserRepository } from "../repositories/userRepository";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Authentication middleware.
 * - Validates JWT signature.
 * - Validates that user still exists in database/repository (protects against stale/revoked tokens).
 * - Standardizes error signatures to follow: { success, error, code }.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Unauthorized access: Token missing",
        code: "UNAUTHORIZED",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);

    // Hardening check: make sure the user still exists in the database
    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized access: Account no longer active",
        code: "UNAUTHORIZED",
      });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: err?.message || "Unauthorized access: Invalid or expired token",
      code: "UNAUTHORIZED",
    });
  }
}
