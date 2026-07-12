import { env } from "../config/env";
import { OpenAICompatibleProvider } from "./openaiCompatibleProvider";
import { ProviderOptions } from "./types";
import { resolveModel } from "./providerRegistry";

export class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor(options?: ProviderOptions) {
    super({
      providerName: "deepseek",
      apiKey: env.DEEPSEEK_API_KEY,
      apiUrl: "https://api.deepseek.com/v1/chat/completions",
      model: resolveModel("deepseek", options?.model),
    });
  }
}
