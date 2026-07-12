import {
  AIProvider,
  AIProviderResponse,
  ChatMessage,
  ChatResponse,
} from "./types";
import { buildSystemPrompt, parseProjectResponse } from "../services/promptService";
import { classifyHttpError, classifyNetworkError, ProviderError } from "./errors";
import { withRetry, mergeAbortSignals } from "./retry";

export interface OpenAICompatibleConfig {
  providerName: string;
  apiKey: string;
  apiUrl: string;
  model: string;
  extraHeaders?: Record<string, string>;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

const CHAT_SYSTEM_PROMPT = `You are a developer assistant for Cognify-AI workspace.
Help the user edit, write, or refactor frontend code (React, Next.js, HTML, CSS, TypeScript, Tailwind).
Output clean, modular instructions or component suggestions.
If updating code, wrap the updated component in \`\`\`tsx ... \`\`\` code blocks.`;

export class OpenAICompatibleProvider implements AIProvider {
  readonly providerName: string;
  private readonly apiKey: string;
  private readonly apiUrl: string;
  protected readonly model: string;
  private readonly extraHeaders: Record<string, string>;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private readonly timeoutMs: number;

  constructor(config: OpenAICompatibleConfig) {
    this.providerName = config.providerName;
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    this.model = config.model;
    this.extraHeaders = config.extraHeaders ?? {};
    this.maxTokens = config.maxTokens ?? 8192;
    this.temperature = config.temperature ?? 0.2;
    this.timeoutMs = config.timeoutMs ?? 120_000;
  }

  getActiveModel(): string {
    return this.model;
  }

  getProviderName(): string {
    return this.providerName;
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
    const systemPrompt = buildSystemPrompt();
    await this.streamCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      (textPart, accumulated) => {
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
    const chatMessages: ChatMessage[] = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...messages.filter((m) => m.role !== "system"),
    ];

    await this.streamCompletion(
      chatMessages,
      (textPart) => onChunk({ text: textPart }),
      signal,
      false
    );
  }

  private async streamCompletion(
    messages: ChatMessage[],
    onText: (textPart: string, accumulated: string) => void,
    signal?: AbortSignal,
    parseAsProject = true
  ): Promise<void> {
    await withRetry(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      const combinedSignal = signal
        ? mergeAbortSignals(signal, controller.signal)
        : controller.signal;

      try {
        let response: Response;
        try {
          response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
              "X-Client-Name": "Cognify-AI",
              "X-Client-Version": "1.0.0",
              ...this.extraHeaders,
            },
            body: JSON.stringify({
              model: this.model,
              messages,
              stream: true,
              max_tokens: this.maxTokens,
              temperature: this.temperature,
            }),
            signal: combinedSignal,
          });
        } catch (fetchErr) {
          throw classifyNetworkError(this.providerName, fetchErr);
        }

        if (!response.ok) {
          let body = "";
          try {
            body = await response.text();
          } catch {
            // ignore
          }
          throw classifyHttpError(this.providerName, response.status, body);
        }

        const body = response.body;
        if (!body) {
          throw new ProviderError(`[${this.providerName}] Empty response body.`, {
            code: "PROVIDER_ERROR",
            provider: this.providerName,
          });
        }

        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let chunksReceived = 0;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const cleaned = line.trim();
              if (!cleaned || cleaned.startsWith(":")) continue;
              if (cleaned === "data: [DONE]") return;

              if (cleaned.startsWith("data: ")) {
                const dataStr = cleaned.slice(6).trim();
                if (!dataStr) continue;

                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.error) {
                    const msg =
                      typeof parsed.error === "string"
                        ? parsed.error
                        : parsed.error?.message ?? "Unknown API error";
                    throw new ProviderError(`[${this.providerName}] ${msg}`, {
                      code: "PROVIDER_ERROR",
                      provider: this.providerName,
                    });
                  }

                  const textPart: string =
                    parsed.choices?.[0]?.delta?.content ?? "";
                  const finishReason = parsed.choices?.[0]?.finish_reason;

                  if (
                    finishReason &&
                    !["stop", "length", null].includes(finishReason)
                  ) {
                    throw new ProviderError(
                      `[${this.providerName}] Generation stopped: ${finishReason}`,
                      { code: "PROVIDER_ERROR", provider: this.providerName }
                    );
                  }

                  if (textPart) {
                    chunksReceived++;
                    accumulated += textPart;
                    onText(textPart, accumulated);
                  }
                } catch (parseErr) {
                  if (parseErr instanceof ProviderError) throw parseErr;
                }
              }
            }
          }
        } finally {
          try {
            reader.releaseLock();
          } catch {
            // already released
          }
        }

        if (chunksReceived === 0 && parseAsProject) {
          throw new ProviderError(
            `[${this.providerName}] No content returned. Check model configuration.`,
            { code: "PROVIDER_ERROR", provider: this.providerName }
          );
        }
      } finally {
        clearTimeout(timeout);
      }
    }, { signal });
  }
}
