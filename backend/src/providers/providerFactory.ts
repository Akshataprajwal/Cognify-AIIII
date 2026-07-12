import { AIProvider, ProviderOptions } from "./types";
import { GeminiProvider } from "./geminiProvider";
import { OpenAIProvider } from "./openaiProvider";
import { AnthropicProvider } from "./anthropicProvider";
import { OpenRouterProvider } from "./openrouterProvider";
import { GroqProvider } from "./groqProvider";
import { TogetherProvider } from "./togetherProvider";
import { DeepSeekProvider } from "./deepseekProvider";
import { CodeZenProvider } from "./codezenProvider";
import { OpenAICompatibleCustomProvider } from "./openaiCompatibleCustomProvider";
import { env } from "../config/env";
import { createConfigError, ProviderError } from "./errors";
import {
  detectDefaultProvider,
  getConfiguredProviders,
  isProviderConfigured,
  PROVIDER_REGISTRY,
} from "./providerRegistry";

export type ProviderType =
  | "gemini"
  | "openai"
  | "anthropic"
  | "openrouter"
  | "groq"
  | "together"
  | "deepseek"
  | "codezen"
  | "openai_compatible";

const ENV_KEY_MAP: Record<string, string> = {
  gemini: "GEMINI_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  groq: "GROQ_API_KEY",
  together: "TOGETHER_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  codezen: "CODEZEN_API_KEY",
  openai_compatible: "OPENAI_COMPATIBLE_API_KEY",
};

export class ProviderFactory {
  /**
   * Returns a configured provider instance.
   * Throws ProviderError with structured code if misconfigured.
   */
  static getProvider(
    providerType?: string,
    options?: ProviderOptions
  ): AIProvider {
    const selected = (providerType || env.DEFAULT_AI_PROVIDER || "")
      .toLowerCase()
      .trim();

    if (!selected) {
      throw new ProviderError(
        "[ProviderFactory] No provider specified and DEFAULT_AI_PROVIDER is not set.",
        { code: "PROVIDER_CONFIG_ERROR", provider: "unknown" }
      );
    }

    if (!isProviderConfigured(selected)) {
      const envKey = ENV_KEY_MAP[selected] ?? `${selected.toUpperCase()}_API_KEY`;
      throw createConfigError(selected, envKey);
    }

    switch (selected as ProviderType) {
      case "gemini":
        return new GeminiProvider(options);
      case "openai":
        return new OpenAIProvider(options);
      case "anthropic":
        return new AnthropicProvider(options);
      case "openrouter":
        return new OpenRouterProvider(options);
      case "groq":
        return new GroqProvider(options);
      case "together":
        return new TogetherProvider(options);
      case "deepseek":
        return new DeepSeekProvider(options);
      case "codezen":
        return new CodeZenProvider(options);
      case "openai_compatible":
        if (!env.OPENAI_COMPATIBLE_API_URL) {
          throw createConfigError("openai_compatible", "OPENAI_COMPATIBLE_API_URL");
        }
        return new OpenAICompatibleCustomProvider(options);
      default:
        throw new ProviderError(
          `[ProviderFactory] Unknown AI provider: "${selected}". ` +
            `Valid: ${PROVIDER_REGISTRY.map((p) => p.id).join(", ")}`,
          { code: "PROVIDER_CONFIG_ERROR", provider: selected }
        );
    }
  }

  /** List providers that have API keys configured on the server */
  static listConfiguredProviders() {
    return getConfiguredProviders();
  }

  /** Resolve the best available provider name without throwing */
  static resolveProviderName(clientProvider?: string): string {
    const candidates = [clientProvider, env.DEFAULT_AI_PROVIDER, detectDefaultProvider()]
      .map((p) => (p || "").trim().toLowerCase())
      .filter((p) => p);

    for (const candidate of candidates) {
      if (isProviderConfigured(candidate)) return candidate;
    }
    return "";
  }

  /** Safe provider init — returns error object instead of throwing */
  static tryGetProvider(
    providerType?: string,
    options?: ProviderOptions
  ): { provider: AIProvider } | { error: ProviderError } {
    try {
      return { provider: ProviderFactory.getProvider(providerType, options) };
    } catch (err) {
      if (err instanceof ProviderError) return { error: err };
      return {
        error: new ProviderError(
          err instanceof Error ? err.message : "Provider initialization failed",
          { code: "PROVIDER_INIT_ERROR", provider: providerType ?? "unknown" }
        ),
      };
    }
  }

  /**
   * Returns configured providers in failover order:
   * requested provider first, configured default next, then all remaining configured providers.
   */
  static getProviderFailoverOrder(clientProvider?: string): string[] {
    const configuredIds = getConfiguredProviders().map((provider) => provider.id);
    const preferred = [
      clientProvider,
      env.DEFAULT_AI_PROVIDER,
      detectDefaultProvider(),
      ...configuredIds,
    ]
      .map((provider) => (provider || "").trim().toLowerCase())
      .filter((provider) => provider && isProviderConfigured(provider));

    return [...new Set(preferred)];
  }
}
