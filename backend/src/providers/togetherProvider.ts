import { env } from "../config/env";
import { OpenAICompatibleProvider } from "./openaiCompatibleProvider";
import { ProviderOptions } from "./types";
import { resolveModel } from "./providerRegistry";

export class TogetherProvider extends OpenAICompatibleProvider {
  constructor(options?: ProviderOptions) {
    super({
      providerName: "together",
      apiKey: env.TOGETHER_API_KEY,
      apiUrl: "https://api.together.xyz/v1/chat/completions",
      model: resolveModel("together", options?.model),
    });
  }
}
