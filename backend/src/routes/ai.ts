import { Router } from "express";
import { AIController } from "../controllers/aiController";
import { optionalAuthenticate } from "../middleware/optionalAuthenticate";
import { aiLimiter } from "../middleware/rateLimiter";

export const aiRouter = Router();

// GET /api/ai/providers - list server-configured providers (no keys exposed)
aiRouter.get("/providers", AIController.listProviders);

// GET /api/ai/verify - test configured provider connectivity (no keys exposed)
aiRouter.get("/verify", aiLimiter, AIController.verify);

// POST /api/ai/generate - SSE streaming generation (optional auth)
// optionalAuthenticate runs first to populate req.userId before rateLimiter keys on it.
aiRouter.post("/generate", optionalAuthenticate as any, aiLimiter, AIController.generate);

// POST /api/ai/improve - prompt improvement (no auth required)
aiRouter.post("/improve", aiLimiter, AIController.improve);

// POST /api/ai/chat - AI assistant chat (optional auth)
aiRouter.post("/chat", optionalAuthenticate as any, aiLimiter, AIController.chat);
