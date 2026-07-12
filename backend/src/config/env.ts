import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const backendEnvPath = path.join(backendRoot, ".env");

dotenv.config({ path: backendEnvPath });
dotenv.config();

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/cognify_ai";

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

const optionalNonEmpty = (key: string, fallback: string): string => {
  const value = process.env[key]?.trim();
  if (value) return value;
  process.env[key] = fallback;
  return fallback;
};

const requireInProd = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return fallback;
  }
  return value;
};

export type AIProviderName =
  | ""
  | "gemini"
  | "openai"
  | "anthropic"
  | "openrouter"
  | "groq"
  | "together"
  | "deepseek"
  | "codezen"
  | "openai_compatible";

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? "development",

  DATABASE_URL: optionalNonEmpty("DATABASE_URL", DEFAULT_DATABASE_URL),

  JWT_SECRET: requireInProd("JWT_SECRET", "dev-secret-change-in-production-min-32-chars"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),
  REFRESH_TOKEN_SECRET: requireInProd(
    "REFRESH_TOKEN_SECRET",
    "dev-refresh-secret-change-in-production-min-32-chars"
  ),
  REFRESH_TOKEN_EXPIRES_IN: optional("REFRESH_TOKEN_EXPIRES_IN", "30d"),

  DEFAULT_AI_PROVIDER: optional("DEFAULT_AI_PROVIDER", "") as AIProviderName,

  GEMINI_API_KEY: optional("GEMINI_API_KEY", ""),
  GEMINI_MODEL: optional("GEMINI_MODEL", "gemini-2.5-flash"),
  OPENAI_API_KEY: optional("OPENAI_API_KEY", ""),
  OPENAI_MODEL: optional("OPENAI_MODEL", "gpt-4o-mini"),
  ANTHROPIC_API_KEY: optional("ANTHROPIC_API_KEY", ""),
  OPENROUTER_API_KEY: optional("OPENROUTER_API_KEY", ""),
  OPENROUTER_MODEL: optional("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free"),
  GROQ_API_KEY: optional("GROQ_API_KEY", ""),
  GROQ_MODEL: optional("GROQ_MODEL", "llama-3.3-70b-versatile"),
  TOGETHER_API_KEY: optional("TOGETHER_API_KEY", ""),
  TOGETHER_MODEL: optional("TOGETHER_MODEL", "meta-llama/Llama-3.3-70B-Instruct-Turbo"),
  DEEPSEEK_API_KEY: optional("DEEPSEEK_API_KEY", ""),
  DEEPSEEK_MODEL: optional("DEEPSEEK_MODEL", "deepseek-chat"),

  // Generic OpenAI-compatible endpoint (LM Studio, Ollama proxy, etc.)
  OPENAI_COMPATIBLE_API_KEY: optional("OPENAI_COMPATIBLE_API_KEY", ""),
  OPENAI_COMPATIBLE_API_URL: optional("OPENAI_COMPATIBLE_API_URL", ""),
  OPENAI_COMPATIBLE_MODEL: optional("OPENAI_COMPATIBLE_MODEL", ""),

  CODEZEN_API_KEY: optional("CODEZEN_API_KEY", ""),
  CODEZEN_API_KEY_2: optional("CODEZEN_API_KEY_2", ""),
  CODEZEN_KEY2_MODELS: optional("CODEZEN_KEY2_MODELS", ""),
  CODEZEN_API_URL: optional("CODEZEN_API_URL", ""),
  CODEZEN_MODEL: optional("CODEZEN_MODEL", ""),

  CORS_ORIGIN: optional("CORS_ORIGIN", "http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: Number(optional("RATE_LIMIT_WINDOW_MS", "60000")),
  RATE_LIMIT_MAX: Number(optional("RATE_LIMIT_MAX", "60")),
  AI_RATE_LIMIT_MAX: Number(optional("AI_RATE_LIMIT_MAX", "20")),
  AI_REQUEST_TIMEOUT_MS: Number(optional("AI_REQUEST_TIMEOUT_MS", "120000")),

  REDIS_URL: optional("REDIS_URL", ""),
} as const;

export type Env = typeof env;

export function validateEnv(): void {
  const errors: string[] = [];

  if (env.NODE_ENV === "production") {
    if (env.JWT_SECRET.includes("dev-secret")) {
      errors.push("JWT_SECRET is using development default in production");
    }
    if (env.REFRESH_TOKEN_SECRET.includes("dev-refresh-secret")) {
      errors.push("REFRESH_TOKEN_SECRET is using development default in production");
    }
  }

  if (env.NODE_ENV === "production" && !env.DATABASE_URL) {
    errors.push("DATABASE_URL is not set in production");
  }

  const validProviders: AIProviderName[] = [
    "gemini",
    "openai",
    "anthropic",
    "openrouter",
    "groq",
    "together",
    "deepseek",
    "codezen",
    "openai_compatible",
  ];

  if (env.DEFAULT_AI_PROVIDER && !validProviders.includes(env.DEFAULT_AI_PROVIDER)) {
    errors.push(
      `Invalid DEFAULT_AI_PROVIDER: "${env.DEFAULT_AI_PROVIDER}". ` +
        `Valid values: ${validProviders.filter(Boolean).join(", ")}`
    );
  }

  const configuredByProvider: Record<Exclude<AIProviderName, "">, boolean> = {
    gemini: Boolean(env.GEMINI_API_KEY),
    openai: Boolean(env.OPENAI_API_KEY),
    anthropic: Boolean(env.ANTHROPIC_API_KEY),
    openrouter: Boolean(env.OPENROUTER_API_KEY),
    groq: Boolean(env.GROQ_API_KEY),
    together: Boolean(env.TOGETHER_API_KEY),
    deepseek: Boolean(env.DEEPSEEK_API_KEY),
    codezen: Boolean(env.CODEZEN_API_KEY || env.CODEZEN_API_KEY_2),
    openai_compatible: Boolean(
      env.OPENAI_COMPATIBLE_API_KEY && env.OPENAI_COMPATIBLE_API_URL
    ),
  };

  if (
    env.DEFAULT_AI_PROVIDER &&
    !configuredByProvider[env.DEFAULT_AI_PROVIDER]
  ) {
    errors.push(
      `DEFAULT_AI_PROVIDER is "${env.DEFAULT_AI_PROVIDER}" but its required server-side configuration is missing.`
    );
  }

  const configuredKeys = [
    env.GEMINI_API_KEY && "gemini",
    env.GROQ_API_KEY && "groq",
    env.OPENROUTER_API_KEY && "openrouter",
    env.TOGETHER_API_KEY && "together",
    env.DEEPSEEK_API_KEY && "deepseek",
    env.OPENAI_API_KEY && "openai",
    env.ANTHROPIC_API_KEY && "anthropic",
    (env.CODEZEN_API_KEY || env.CODEZEN_API_KEY_2) && "codezen",
    (env.OPENAI_COMPATIBLE_API_KEY && env.OPENAI_COMPATIBLE_API_URL) &&
      "openai_compatible",
  ].filter(Boolean);

  if (!env.DEFAULT_AI_PROVIDER && configuredKeys.length === 0) {
    console.warn(
      "[Env] No AI provider keys configured. Set at least one API key in backend/.env " +
        "(e.g. GEMINI_API_KEY or GROQ_API_KEY)."
    );
  } else if (configuredKeys.length > 0) {
    console.log(`[Env] Configured AI providers: ${configuredKeys.join(", ")}`);
  }

  console.log(
    `[Env] Default AI provider: ${env.DEFAULT_AI_PROVIDER || "(auto-detect)"}`
  );
  console.log(
    env.GEMINI_API_KEY
      ? `[Env] GEMINI_API_KEY loaded securely from environment (length=${env.GEMINI_API_KEY.length}).`
      : "[Env] GEMINI_API_KEY is not set."
  );
  console.log(`[Env] Gemini model default: ${env.GEMINI_MODEL}`);

  if (errors.length > 0) {
    console.error("[Env] Configuration errors:");
    errors.forEach((err) => console.error(`  - ${err}`));
    if (env.NODE_ENV === "production") {
      throw new Error("Environment configuration errors prevent startup");
    }
  } else {
    console.log("[Env] Configuration validated successfully");
  }
}
