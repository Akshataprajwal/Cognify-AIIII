import { env } from "../config/env";
import { OpenAICompatibleProvider } from "./openaiCompatibleProvider";
import { ProviderOptions } from "./types";
import { resolveModel } from "./providerRegistry";

export class GroqProvider extends OpenAICompatibleProvider {
  constructor(options?: ProviderOptions) {
    super({
      providerName: "groq",
      apiKey: env.GROQ_API_KEY,
      apiUrl: "https://api.groq.com/openai/v1/chat/completions",
      model: resolveModel("groq", options?.model),
      extraHeaders: {},
    });
  }
}
