import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";
import { authLimiter, twoFactorLimiter } from "../middleware/rateLimiter";

export const authRouter = Router();

authRouter.post("/register", authLimiter, AuthController.register);
authRouter.post("/login", authLimiter, AuthController.login);
authRouter.get("/me", authenticate as any, AuthController.me as any);
authRouter.post("/refresh", authLimiter, AuthController.refresh);
authRouter.post("/logout", authenticate as any, AuthController.logout as any);

// Admin 2FA — extra rate-limited; no auth middleware (uses temp token internally)
authRouter.post("/admin/verify-code", twoFactorLimiter, AuthController.adminVerifyCode);
