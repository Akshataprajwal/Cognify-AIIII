import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env, validateEnv } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { aiRouter } from "./routes/ai";
import { adminRouter } from "./routes/admin";
import { generalLimiter } from "./middleware/rateLimiter";
import { logger } from "./logger";

// Validate environment configuration on startup
validateEnv();

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow SSE streaming
    crossOriginEmbedderPolicy: false,
  })
);

// CORS – allow frontend origin
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Health check (no auth, no rate limit beyond general)
app.get("/", (_req, res) => res.json({ ok: true, service: "cognify-ai-backend" }));
app.use("/api/health", healthRouter);

// Auth routes
app.use("/api/auth", authRouter);

// AI generation routes
app.use("/api/ai", aiRouter);

// Admin routes (protected by authentication and admin check)
app.use("/api/admin", adminRouter);

// Global error handler
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Backend listening");
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      { port: env.PORT, code: error.code, errno: error.errno },
      "Port already in use. Check for another backend instance or change PORT in environment."
    );
  } else {
    logger.error({ error, port: env.PORT }, "Server failed to start.");
  }
  process.exit(1);
});
