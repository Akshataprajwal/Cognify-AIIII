import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { UserRepository } from "../repositories/userRepository";

export interface OptionalAuthRequest extends Request {
  userId?: string;
}

/**
 * Optional authentication middleware.
 * - If an Authorization Bearer token is present → validates it and sets req.userId.
 * - Confirms that the user exists in the database to prevent attributing data to deleted accounts.
 * - If validation fails or account doesn't exist → falls back to anonymous client context.
 */
export async function optionalAuthenticate(
  req: OptionalAuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    
    const user = await UserRepository.findById(decoded.userId);
    if (user) {
      req.userId = decoded.userId;
    }
  } catch {
    // Token parsing failed or user missing — fall back to anonymous context safely
  }

  next();
}
