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

export class AnthropicProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(options?: ProviderOptions, apiKey?: string) {
    this.apiKey = apiKey || env.ANTHROPIC_API_KEY;
    this.model = resolveModel("anthropic", options?.model);
    if (!this.apiKey) {
      throw new ProviderError("Anthropic API key is not configured.", {
        code: "PROVIDER_CONFIG_ERROR",
        provider: "anthropic",
      });
    }
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
    await this.streamMessages(
      buildSystemPrompt(),
      [{ role: "user", content: prompt }],
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
    const userMessages = messages.filter((m) => m.role !== "system");
    await this.streamMessages(
      CHAT_SYSTEM,
      userMessages,
      (accumulated) => onChunk({ text: accumulated }),
      signal,
      false
    );
  }

  private async streamMessages(
    system: string,
    messages: ChatMessage[],
    onAccumulated: (accumulated: string) => void,
    signal?: AbortSignal,
    requireContent = true
  ): Promise<void> {
    await withRetry(async () => {
      let response: Response;
      try {
        response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 8192,
            system,
            messages: messages.map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
            stream: true,
          }),
          signal,
        });
      } catch (err) {
        throw classifyNetworkError("anthropic", err);
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw classifyHttpError("anthropic", response.status, body);
      }

      const body = response.body;
      if (!body) {
        throw new ProviderError("[anthropic] Empty response body.", {
          code: "PROVIDER_ERROR",
          provider: "anthropic",
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
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned.startsWith("data: ")) continue;
          const dataStr = cleaned.slice(6);
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              received = true;
              accumulated += parsed.delta.text;
              onAccumulated(accumulated);
            }
          } catch {
            // partial chunk
          }
        }
      }

      if (requireContent && !received) {
        throw new ProviderError("[anthropic] No content returned.", {
          code: "PROVIDER_ERROR",
          provider: "anthropic",
        });
      }
    }, { signal });
  }
}
