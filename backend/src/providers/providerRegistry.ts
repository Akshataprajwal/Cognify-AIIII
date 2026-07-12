import { env } from "../config/env";
import { ProviderDefinition } from "./types";

const uniqueModels = (models: string[]): string[] =>
  models.filter((model, index) => model && models.indexOf(model) === index);

export const PROVIDER_REGISTRY: ProviderDefinition[] = [
  {
    id: "gemini",
    name: "Default Gemini Project",
    description: "Primary Gemini project for production frontend generation",
    envKey: "GEMINI_API_KEY",
    freeTier: true,
    defaultModel: env.GEMINI_MODEL,
    models: uniqueModels([
      env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-pro-latest",
    ]),
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference; free tier available",
    envKey: "GROQ_API_KEY",
    freeTier: true,
    defaultModel: env.GROQ_MODEL,
    models: uniqueModels([
      env.GROQ_MODEL,
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ]),
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Multi-model gateway; free models available",
    envKey: "OPENROUTER_API_KEY",
    freeTier: true,
    defaultModel: env.OPENROUTER_MODEL,
    models: uniqueModels([
      env.OPENROUTER_MODEL,
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-2-9b-it:free",
      "qwen/qwen-2.5-coder-32b-instruct",
      "deepseek/deepseek-r1:free",
    ]),
  },
  {
    id: "together",
    name: "Together AI",
    description: "Open-source models; free credits on signup",
    envKey: "TOGETHER_API_KEY",
    freeTier: true,
    defaultModel: env.TOGETHER_MODEL,
    models: uniqueModels([
      env.TOGETHER_MODEL,
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "meta-llama/Llama-3.2-3B-Instruct-Turbo",
      "Qwen/Qwen2.5-Coder-32B-Instruct",
      "deepseek-ai/DeepSeek-V3",
    ]),
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek Coder; cost-effective code generation",
    envKey: "DEEPSEEK_API_KEY",
    freeTier: true,
    defaultModel: env.DEEPSEEK_MODEL,
    models: uniqueModels([env.DEEPSEEK_MODEL, "deepseek-chat", "deepseek-coder"]),
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o family; paid API",
    envKey: "OPENAI_API_KEY",
    freeTier: false,
    defaultModel: env.OPENAI_MODEL,
    models: uniqueModels([env.OPENAI_MODEL, "gpt-4o-mini", "gpt-4o", "gpt-4-turbo"]),
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Claude 3.5 Sonnet; paid API",
    envKey: "ANTHROPIC_API_KEY",
    freeTier: false,
    defaultModel: "claude-3-5-sonnet-20241022",
    models: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
    ],
  },
  {
    id: "codezen",
    name: "CodeZen",
    description: "OpenAI-compatible dual-key engine",
    envKey: "CODEZEN_API_KEY",
    freeTier: false,
    defaultModel: "codezen-1",
    models: [
      "codezen-1",
      "gpt-5-mini",
      "gpt-5-nano",
      "claude-opus-4-7",
      "gemini-3.1-flash-lite-preview",
    ],
  },
  {
    id: "openai_compatible",
    name: "OpenAI Compatible",
    description: "Any OpenAI-compatible API endpoint",
    envKey: "OPENAI_COMPATIBLE_API_KEY",
    freeTier: false,
    defaultModel: env.OPENAI_COMPATIBLE_MODEL || "default",
    models: env.OPENAI_COMPATIBLE_MODEL
      ? [env.OPENAI_COMPATIBLE_MODEL]
      : ["default"],
  },
];

export function isProviderConfigured(providerId: string): boolean {
  switch (providerId) {
    case "gemini":
      return Boolean(env.GEMINI_API_KEY);
    case "openai":
      return Boolean(env.OPENAI_API_KEY);
    case "anthropic":
      return Boolean(env.ANTHROPIC_API_KEY);
    case "openrouter":
      return Boolean(env.OPENROUTER_API_KEY);
    case "groq":
      return Boolean(env.GROQ_API_KEY);
    case "together":
      return Boolean(env.TOGETHER_API_KEY);
    case "deepseek":
      return Boolean(env.DEEPSEEK_API_KEY);
    case "codezen":
      return Boolean(env.CODEZEN_API_KEY || env.CODEZEN_API_KEY_2);
    case "openai_compatible":
      return Boolean(env.OPENAI_COMPATIBLE_API_KEY && env.OPENAI_COMPATIBLE_API_URL);
    default:
      return false;
  }
}

export function getConfiguredProviders() {
  return PROVIDER_REGISTRY.filter((p) => isProviderConfigured(p.id)).map((p) => ({
    id: p.id,
    name: p.name,
    configured: true,
    freeTier: p.freeTier,
    defaultModel: p.defaultModel,
    models: p.models,
  }));
}

export function resolveModel(providerId: string, requestedModel?: string): string {
  const def = PROVIDER_REGISTRY.find((p) => p.id === providerId);
  if (!requestedModel?.trim()) {
    return def?.defaultModel ?? requestedModel ?? "";
  }
  if (def && def.models.includes(requestedModel)) {
    return requestedModel;
  }
  return requestedModel;
}

export function detectDefaultProvider(): string {
  if (env.DEFAULT_AI_PROVIDER && isProviderConfigured(env.DEFAULT_AI_PROVIDER)) {
    return env.DEFAULT_AI_PROVIDER;
  }
  const priority = [
    "gemini",
    "groq",
    "openrouter",
    "together",
    "deepseek",
    "openai",
    "anthropic",
    "codezen",
    "openai_compatible",
  ];
  for (const id of priority) {
    if (isProviderConfigured(id)) return id;
  }
  return "";
}
