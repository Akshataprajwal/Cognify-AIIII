import { env } from "../config/env";
import { OpenAICompatibleProvider } from "./openaiCompatibleProvider";
import { ProviderOptions } from "./types";

export class OpenAICompatibleCustomProvider extends OpenAICompatibleProvider {
  constructor(options?: ProviderOptions) {
    const apiUrl = env.OPENAI_COMPATIBLE_API_URL;
    const apiKey = env.OPENAI_COMPATIBLE_API_KEY;
    const model = options?.model || env.OPENAI_COMPATIBLE_MODEL || "default";

    super({
      providerName: "openai_compatible",
      apiKey,
      apiUrl,
      model,
    });
  }
}
