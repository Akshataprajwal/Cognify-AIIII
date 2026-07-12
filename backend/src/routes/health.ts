import { Router } from "express";
import { env } from "../config/env";
import { db } from "../config/db";
import { getConfiguredProviders, detectDefaultProvider } from "../providers/providerRegistry";

interface HealthResponse {
  ok: boolean;
  service: string;
  timestamp: string;
  environment: string;
  version: string;
  database?: string;
  aiProvider?: {
    default: string;
    configured: boolean;
    available: string[];
  };
}

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const available = getConfiguredProviders().map((p) => p.id);
  const defaultProvider =
    env.DEFAULT_AI_PROVIDER || detectDefaultProvider() || "(not configured)";

  const health: HealthResponse = {
    ok: true,
    service: "cognify-ai-backend",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || "0.1.0",
    aiProvider: {
      default: defaultProvider,
      configured: available.length > 0,
      available,
    },
  };

  try {
    await db.$queryRaw`SELECT 1`;
    health.database = "connected";
  } catch {
    health.database = "disconnected";
  }

  res.json(health);
});
