import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/authValidator";
import { AuthService } from "../services/authService";
import { TwoFactorService } from "../services/twoFactorService";
import { TempTokenService } from "../services/tempTokenService";
import { UserRepository } from "../repositories/userRepository";
import { AuthenticatedRequest } from "../middleware/authenticate";
import { sendSuccess, sendError } from "../utils/apiResponse";

const verifyCodeSchema = {
  parse: (body: unknown) => {
    const b = body as Record<string, unknown>;
    if (typeof b.tempToken !== "string" || !b.tempToken) {
      throw new Error("tempToken is required");
    }
    if (typeof b.code !== "string" || !/^\d{6}$/.test(b.code)) {
      throw new Error("code must be a 6-digit number");
    }
    return { tempToken: b.tempToken as string, code: b.code as string };
  },
};

export class AuthController {
  static async register(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, "Validation failed", "VALIDATION_ERROR", 400, parsed.error.format());
        return;
      }

      const result = await AuthService.register(parsed.data);
      sendSuccess(res, result, 201);
    } catch (error: any) {
      sendError(res, error?.message || "Registration failed", "AUTH_REGISTER_FAILED", 400);
    }
  }

  static async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, "Validation failed", "VALIDATION_ERROR", 400, parsed.error.format());
        return;
      }

      const result = await AuthService.login(parsed.data);

      // Admin 2FA challenge — return partial response with temp token only
      if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
        sendSuccess(res, {
          requiresTwoFactor: true,
          tempToken: result.tempToken,
          message: "Verification code sent. Check the server console (dev) or your email.",
        });
        return;
      }

      // Regular user — include role for frontend routing
      const user = await UserRepository.findByEmail(parsed.data.email);
      if (user) {
        sendSuccess(res, {
          ...result,
          user: {
            ...(result as any).user,
            role: user.role,
          },
        });
      } else {
        sendSuccess(res, result);
      }
    } catch (error: any) {
      sendError(res, error.message || "Invalid credentials", "AUTH_LOGIN_FAILED", 401);
    }
  }

  /**
   * POST /api/auth/admin/verify-code
   * Accepts { tempToken, code }. On success, issues the full JWT.
   */
  static async adminVerifyCode(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { tempToken, code } = verifyCodeSchema.parse(req.body);

      // 1. Decode and validate the temp token (throws if expired or invalid)
      const tokenPayload = TempTokenService.verify(tempToken);

      // 2. Verify the submitted code against the stored hash
      await TwoFactorService.verifyCode(tokenPayload.userId, code);

      // 3. Issue the full admin session
      const result = await AuthService.finalizeAdminLogin(tokenPayload.userId);

      sendSuccess(res, {
        ...result,
        message: "Two-factor authentication successful.",
      });
    } catch (error: any) {
      const message = error.message || "Verification failed";

      // Map domain error strings to appropriate HTTP status codes
      if (message.includes("expired") || message.includes("No active")) {
        sendError(res, message, "AUTH_2FA_EXPIRED", 410);
        return;
      }
      if (message.includes("Too many")) {
        sendError(res, message, "AUTH_2FA_TOO_MANY_ATTEMPTS", 429);
        return;
      }
      if (message.includes("Invalid or expired session")) {
        sendError(res, message, "AUTH_2FA_INVALID_SESSION", 401);
        return;
      }

      sendError(res, message, "AUTH_2FA_FAILED", 400);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        sendError(res, "Unauthorized", "UNAUTHORIZED", 401);
        return;
      }

      const user = await UserRepository.findById(req.userId);
      if (!user) {
        sendError(res, "User not found", "USER_NOT_FOUND", 404);
        return;
      }

      sendSuccess(res, { user });
    } catch {
      sendError(res, "Failed to fetch user profile", "AUTH_ME_FAILED", 500);
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        sendError(res, "Refresh token required", "AUTH_REFRESH_REQUIRED", 400);
        return;
      }

      const result = await AuthService.refresh(refreshToken);
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message || "Token refresh failed", "AUTH_REFRESH_FAILED", 401);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.userId) {
        await AuthService.logout(req.userId);
      }
      sendSuccess(res, { message: "Logged out successfully" });
    } catch {
      sendError(res, "Logout failed", "AUTH_LOGOUT_FAILED", 500);
    }
  }
}
