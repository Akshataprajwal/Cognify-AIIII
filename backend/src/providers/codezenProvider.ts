import { env } from "../config/env";
import { OpenAICompatibleProvider } from "./openaiCompatibleProvider";
import { ProviderOptions } from "./types";
import { createConfigError, ProviderError } from "./errors";

export interface CodeZenProviderOptions extends ProviderOptions {
  model?: string;
}

export class CodeZenProvider extends OpenAICompatibleProvider {
  private readonly keySlot: "primary" | "secondary";

  constructor(options?: CodeZenProviderOptions) {
    const requestedModel = options?.model?.trim() || "";
    const key2ModelSet = new Set<string>(
      (env.CODEZEN_KEY2_MODELS || "")
        .split(",")
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean)
    );

    const isKey2Model =
      requestedModel !== "" && key2ModelSet.has(requestedModel.toLowerCase());

    let apiKey: string;
    let model: string;
    let keySlot: "primary" | "secondary";

    if (isKey2Model && env.CODEZEN_API_KEY_2) {
      apiKey = env.CODEZEN_API_KEY_2;
      model = requestedModel;
      keySlot = "secondary";
    } else {
      const primaryKey = env.CODEZEN_API_KEY;
      if (!primaryKey) {
        const hasKey2 = Boolean(env.CODEZEN_API_KEY_2);
        throw createConfigError(
          "codezen",
          hasKey2
            ? `CODEZEN_API_KEY (model "${requestedModel}" not in CODEZEN_KEY2_MODELS)`
            : "CODEZEN_API_KEY"
        );
      }
      apiKey = primaryKey;
      model = requestedModel || env.CODEZEN_MODEL || "codezen-1";
      keySlot = "primary";
    }

    super({
      providerName: "codezen",
      apiKey,
      apiUrl:
        env.CODEZEN_API_URL ||
        "https://llm-gateway.codzen.ai/v1/chat/completions",
      model,
      extraHeaders: {
        "X-Client-Name": "Cognify-AI",
        "X-Client-Version": "1.0.0",
      },
    });

    this.keySlot = keySlot;
  }

  getActiveModel(): string {
    return this.model;
  }

  getKeySlot(): "primary" | "secondary" {
    return this.keySlot;
  }
}

// Re-export for backward compatibility with CODEZEN_ERROR code
export { ProviderError as CodeZenError };
