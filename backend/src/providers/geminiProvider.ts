import {
  AIProvider,
  AIProviderResponse,
  ChatMessage,
  ChatResponse,
  ProviderOptions,
} from "./types";
import { env } from "../config/env";
import { buildSystemPrompt, parseProjectResponse } from "../services/promptService";
import { classifyHttpError, classifyNetworkError, ProviderError } from "./errors";
import { resolveModel } from "./providerRegistry";
import { withRetry } from "./retry";

const CHAT_SYSTEM = `You are a developer assistant for Cognify-AI workspace.
Help the user edit, write, or refactor frontend code. Output clean suggestions.
If updating code, wrap in \`\`\`tsx ... \`\`\` blocks.`;

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(options?: ProviderOptions, apiKey?: string) {
    this.apiKey = apiKey || env.GEMINI_API_KEY;
    this.model = resolveModel("gemini", options?.model);
    if (!this.apiKey) {
      throw new ProviderError("Gemini API key is not configured.", {
        code: "PROVIDER_CONFIG_ERROR",
        provider: "gemini",
      });
    }
  }

  getActiveModel(): string {
    return this.model;
  }

  getProviderName(): string {
    return "gemini";
  }

  async generate(prompt: string, signal?: AbortSignal): Promise<AIProviderResponse> {
    let result: Partial<AIProviderResponse> = {};
    await this.streamGenerate(prompt, (chunk) => {
      result = { ...result, ...chunk };
    }, signal);
    return result as AIProviderResponse;
  }

  async streamGenerate(
    prompt: string,
    onChunk: (chunk: Partial<AIProviderResponse>) => void,
    signal?: AbortSignal
  ): Promise<void> {
    await this.streamGeminiContent(
      `${buildSystemPrompt()}\n\nUser request: ${prompt}`,
      (accumulated) => {
        const project = parseProjectResponse(accumulated);
        onChunk({
          react: project.files[project.entryPath] || "",
          files: project.files,
          entryPath: project.entryPath,
          projectType: project.projectType,
        });
      },
      signal
    );
  }

  generateStream = this.streamGenerate.bind(this);

  async chat(messages: ChatMessage[], signal?: AbortSignal): Promise<ChatResponse> {
    let text = "";
    await this.streamChat(messages, (chunk) => {
      if (chunk.text) text += chunk.text;
    }, signal);
    return { text };
  }

  async streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: Partial<ChatResponse>) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const combined = [
      CHAT_SYSTEM,
      ...messages.filter((m) => m.role !== "system").map((m) => `${m.role}: ${m.content}`),
    ].join("\n\n");

    await this.streamGeminiContent(combined, (accumulated) => {
      onChunk({ text: accumulated });
    }, signal, false);
  }

  private async streamGeminiContent(
    text: string,
    onAccumulated: (accumulated: string) => void,
    signal?: AbortSignal,
    requireContent = true
  ): Promise<void> {
    await withRetry(async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent`;

      let response: Response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 8192,
            },
          }),
          signal,
        });
      } catch (err) {
        throw classifyNetworkError("gemini", err);
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw classifyHttpError("gemini", response.status, body);
      }

      const body = response.body;
      if (!body) {
        throw new ProviderError("[gemini] Empty response body.", {
          code: "PROVIDER_ERROR",
          provider: "gemini",
        });
      }

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let received = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const objects = this.extractJsonObjects(buffer);
        buffer = objects.remainder;

        for (const jsonStr of objects.chunks) {
          try {
            const parsed = JSON.parse(jsonStr);
            const candidate = parsed.candidates?.[0];
            if (
              candidate?.finishReason &&
              !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)
            ) {
              throw new ProviderError(
                `[gemini] Blocked by safety: ${candidate.finishReason}`,
                { code: "PROVIDER_ERROR", provider: "gemini" }
              );
            }
            const textPart = candidate?.content?.parts?.[0]?.text || "";
            if (textPart) {
              received = true;
              accumulated += textPart;
              onAccumulated(accumulated);
            }
          } catch (err) {
            if (err instanceof ProviderError) throw err;
          }
        }
      }

      if (requireContent && !received) {
        throw new ProviderError("[gemini] No content returned.", {
          code: "PROVIDER_ERROR",
          provider: "gemini",
        });
      }
    }, { signal });
  }

  private extractJsonObjects(str: string): { chunks: string[]; remainder: string } {
    const chunks: string[] = [];
    let remainder = str;
    let pos: { start: number; end: number } | null;

    while ((pos = this.findCompleteJsonObject(remainder)) !== null) {
      chunks.push(remainder.slice(pos.start, pos.end));
      remainder = remainder.slice(pos.end);
    }
    return { chunks, remainder };
  }

  private findCompleteJsonObject(str: string): { start: number; end: number } | null {
    let start = -1;
    let braceCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
      } else {
        if (char === '"') inString = true;
        else if (char === "{") {
          if (braceCount === 0) start = i;
          braceCount++;
        } else if (char === "}") {
          if (braceCount > 0) {
            braceCount--;
            if (braceCount === 0) return { start, end: i + 1 };
          }
        }
      }
    }
    return null;
  }
}
