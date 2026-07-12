import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { env } from "../config/env";

/**
 * Custom key generator that prioritises authenticated user IDs
 * for accurate limit tracking, falling back to client IP for guests.
 */
const userOrIpKeyGenerator = (req: any): string => {
  return req.userId || ipKeyGenerator(req);
};

/** General API rate limiter */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  keyGenerator: userOrIpKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    ok: false,
    error: "Too many requests. Please slow down and try again.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

/** Stricter limiter for AI generation endpoints */
export const aiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AI_RATE_LIMIT_MAX,
  keyGenerator: userOrIpKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    ok: false,
    error: "AI generation rate limit exceeded. Please wait before generating again.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

/** Auth-specific limiter to prevent brute-force */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  keyGenerator: (req: any) => req.body?.email || ipKeyGenerator(req), // rate-limit by target email or IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    ok: false,
    error: "Too many auth attempts. Please try again in 15 minutes.",
    code: "AUTH_BRUTE_FORCE_PREVENTION",
  },
});

/** Extra-strict limiter for the 2FA code verification endpoint */
export const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator: userOrIpKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    ok: false,
    error: "Too many verification attempts. Please try again in 15 minutes.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});
