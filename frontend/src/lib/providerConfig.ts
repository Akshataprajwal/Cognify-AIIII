export interface ProviderInfo {
  id: string;
  name: string;
  configured: boolean;
  freeTier: boolean;
  defaultModel: string;
  models: string[];
}

export const FALLBACK_PROVIDERS: ProviderInfo[] = [
  {
    id: "gemini",
    name: "Default Gemini Project",
    configured: false,
    freeTier: true,
    defaultModel: "gemini-2.5-flash",
    models: [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-pro-latest",
    ],
  },
  {
    id: "groq",
    name: "Groq",
    configured: false,
    freeTier: true,
    defaultModel: "llama-3.3-70b-versatile",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    configured: false,
    freeTier: true,
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    models: [
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemma-2-9b-it:free",
      "deepseek/deepseek-r1:free",
    ],
  },
  {
    id: "together",
    name: "Together AI",
    configured: false,
    freeTier: true,
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    models: [
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "meta-llama/Llama-3.2-3B-Instruct-Turbo",
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    configured: false,
    freeTier: true,
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-coder"],
  },
  {
    id: "openai",
    name: "OpenAI",
    configured: false,
    freeTier: false,
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o"],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    configured: false,
    freeTier: false,
    defaultModel: "claude-3-5-sonnet-20241022",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
  },
  {
    id: "codezen",
    name: "CodeZen",
    configured: false,
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
    configured: false,
    freeTier: false,
    defaultModel: "default",
    models: ["default"],
  },
];

export const STORAGE_KEYS = {
  provider: "cognify-active-provider",
  model: "cognify-active-model",
} as const;

export function getStoredProvider(): string {
  if (typeof window === "undefined") return "";
  const stored =
    localStorage.getItem(STORAGE_KEYS.provider) ||
    localStorage.getItem("cognify-default-provider") ||
    "";
  return FALLBACK_PROVIDERS.some((provider) => provider.id === stored) ? stored : "";
}

export function getStoredModel(providerId?: string): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(STORAGE_KEYS.model);
  if (stored) return stored;
  const provider = providerId || getStoredProvider();
  const def = FALLBACK_PROVIDERS.find((p) => p.id === provider);
  return def?.defaultModel ?? "";
}

export function setStoredProvider(providerId: string, model?: string): void {
  localStorage.setItem(STORAGE_KEYS.provider, providerId);
  localStorage.setItem("cognify-default-provider", providerId);
  if (model) {
    localStorage.setItem(STORAGE_KEYS.model, model);
  }
}

export function setStoredModel(model: string): void {
  localStorage.setItem(STORAGE_KEYS.model, model);
}
