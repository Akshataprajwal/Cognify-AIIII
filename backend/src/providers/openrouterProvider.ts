import { env } from "../config/env";
import { OpenAICompatibleProvider } from "./openaiCompatibleProvider";
import { ProviderOptions } from "./types";
import { resolveModel } from "./providerRegistry";

export class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor(options?: ProviderOptions) {
    super({
      providerName: "openrouter",
      apiKey: env.OPENROUTER_API_KEY,
      apiUrl: "https://openrouter.ai/api/v1/chat/completions",
      model: resolveModel("openrouter", options?.model),
      extraHeaders: {
        "HTTP-Referer": env.CORS_ORIGIN || "https://cognify-ai.local",
        "X-Title": "Cognify-AI",
      },
    });
  }
}
