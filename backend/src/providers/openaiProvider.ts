import { env } from "../config/env";
import { OpenAICompatibleProvider } from "./openaiCompatibleProvider";
import { ProviderOptions } from "./types";
import { resolveModel } from "./providerRegistry";

export class OpenAIProvider extends OpenAICompatibleProvider {
  constructor(options?: ProviderOptions) {
    super({
      providerName: "openai",
      apiKey: env.OPENAI_API_KEY,
      apiUrl: "https://api.openai.com/v1/chat/completions",
      model: resolveModel("openai", options?.model),
    });
  }
}
