import { GeneratedCode } from "@/store/projectStore";
import { API_BASE as BACKEND_URL } from "@/lib/api";
import { getStoredModel, getStoredProvider } from "@/lib/providerConfig";

export interface GenerateStreamOptions {
  prompt: string;
  onProgress: (code: Partial<GeneratedCode>) => void;
  onProviderError?: (error: StreamProviderError) => void;
  signal?: AbortSignal;
  provider?: string;
  model?: string;
  /** Client-side retry attempts for transient network/rate-limit errors */
  maxRetries?: number;
  timeoutMs?: number;
}

export interface StreamProviderError {
  message: string;
  code?: string;
  provider?: string;
  statusCode?: number;
  retryable?: boolean;
  fallback: boolean;
}

export interface ChatStreamOptions {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
  contextCode?: string;
  provider?: string;
  model?: string;
  onChunk: (text: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface ProviderListResponse {
  providers: Array<{
    id: string;
    name: string;
    configured: boolean;
    freeTier: boolean;
    defaultModel: string;
    models: string[];
  }>;
  defaultProvider: string;
}

function resolveProvider(options?: { provider?: string }): string {
  return options?.provider || getStoredProvider() || "";
}

function resolveModel(options?: { model?: string; provider?: string }): string | undefined {
  const model = options?.model || getStoredModel(options?.provider);
  return model || undefined;
}

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("cognify-auth-token")
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleSessionExpired(): never {
  if (typeof window !== "undefined") {
    document.cookie = "cognify-token=; path=/; max-age=0";
    document.cookie = "cognify-role=; path=/; max-age=0";
    localStorage.removeItem("cognify-auth-token");
    localStorage.removeItem("cognify-auth-refresh-token");
    localStorage.removeItem("cognify-auth-user");
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?expired=true&from=${encodeURIComponent(window.location.pathname)}`;
    }
  }
  throw new Error("Session expired. Please log in again.");
}

class AIServiceError extends Error {
  readonly code?: string;
  readonly provider?: string;
  readonly statusCode?: number;
  readonly retryable?: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      provider?: string;
      statusCode?: number;
      retryable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = "AIServiceError";
    this.code = options.code;
    this.provider = options.provider;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable;
  }
}

function createTimeoutSignal(
  signal: AbortSignal | undefined,
  timeoutMs: number
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort(new DOMException("AI request timed out", "TimeoutError"));
  }, timeoutMs);

  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) abortFromCaller();
    signal.addEventListener("abort", abortFromCaller, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timeout);
      signal?.removeEventListener("abort", abortFromCaller);
    },
  };
}

function errorFromPayload(payload: any, fallback: string): AIServiceError {
  return new AIServiceError(payload?.error || fallback, {
    code: payload?.code,
    provider: payload?.provider,
    statusCode: payload?.statusCode,
    retryable: payload?.retryable,
  });
}

async function parseErrorResponse(
  response: Response,
  fallback: string
): Promise<AIServiceError> {
  const text = await response.text().catch(() => "");
  if (text) {
    try {
      return errorFromPayload(JSON.parse(text), fallback);
    } catch {
      return new AIServiceError(`${fallback}: ${text}`, {
        statusCode: response.status,
      });
    }
  }
  return new AIServiceError(`${fallback}: ${response.statusText}`, {
    statusCode: response.status,
  });
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof AIServiceError && typeof err.retryable === "boolean") {
    return err.retryable;
  }
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("500") ||
    msg.includes("temporarily unavailable")
  );
}

async function withClientRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  signal?: AbortSignal
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (
        signal?.aborted ||
        !isRetryableError(err) ||
        attempt >= maxRetries
      ) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

async function streamBackendGenerate(
  prompt: string,
  onProgress: (code: Partial<GeneratedCode>) => void,
  onProviderError?: (error: StreamProviderError) => void,
  signal?: AbortSignal,
  provider?: string,
  model?: string,
  timeoutMs = 120000
): Promise<void> {
  const timeout = createTimeoutSignal(signal, timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/ai/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ prompt, provider, model }),
      signal: timeout.signal,
    });
  } catch (err) {
    timeout.cleanup();
    if ((err as any)?.name === "AbortError" && !signal?.aborted) {
      throw new AIServiceError("AI generation timed out.", {
        code: "TIMEOUT",
        retryable: true,
      });
    }
    throw err;
  }

  try {
    if (response.status === 401) handleSessionExpired();

    if (!response.ok) {
      throw await parseErrorResponse(
        response,
        `Backend AI Error (${response.status})`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to read backend SSE stream.");

    const decoder = new TextDecoder();
    let buffer = "";
    let receivedUsableCode = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned.startsWith("data: ")) continue;

        const data = cleaned.slice(6);
        if (data === "[DONE]") {
          if (!receivedUsableCode) {
            throw new AIServiceError("AI stream completed without usable frontend code.", {
              code: "EMPTY_GENERATION",
              retryable: true,
            });
          }
          return;
        }

        let chunk: any;
        try {
          chunk = JSON.parse(data);
        } catch {
          continue;
        }

        if (chunk.success === false || chunk.error) {
          throw errorFromPayload(chunk, "Generation failed");
        }

        if (chunk.fallback || chunk.providerError) {
          const providerError = chunk.providerError || {};
          onProviderError?.({
            message:
              providerError.error ||
              chunk.reason ||
              "The AI provider failed and a standalone HTML fallback was generated.",
            code: providerError.code,
            provider: providerError.provider || chunk.provider,
            statusCode: providerError.statusCode,
            retryable: providerError.retryable,
            fallback: true,
          });
        }

        receivedUsableCode =
          receivedUsableCode ||
          Boolean(
            (chunk.files &&
              Object.values(chunk.files as Record<string, string>).some(
                (content) => typeof content === "string" && content.trim().length > 0
              )) ||
              chunk.react?.trim() ||
              chunk.html?.trim()
          );
        const codeChunk = { ...chunk };
        delete codeChunk.fallback;
        delete codeChunk.reason;
        delete codeChunk.provider;
        delete codeChunk.providerError;
        onProgress(codeChunk);
      }
    }

    if (!receivedUsableCode) {
      throw new AIServiceError("AI stream ended without usable frontend code.", {
        code: "EMPTY_GENERATION",
        retryable: true,
      });
    }
  } finally {
    timeout.cleanup();
  }
}

async function streamChatBackend(options: ChatStreamOptions): Promise<void> {
  const provider = resolveProvider(options);
  const model = resolveModel(options);

  const timeout = createTimeoutSignal(options.signal, options.timeoutMs ?? 120000);
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        message: options.message,
        history: options.history || [],
        contextCode: options.contextCode || "",
        provider,
        model,
      }),
      signal: timeout.signal,
    });
  } catch (err) {
    timeout.cleanup();
    if ((err as any)?.name === "AbortError" && !options.signal?.aborted) {
      throw new AIServiceError("AI chat timed out.", {
        code: "TIMEOUT",
        retryable: true,
      });
    }
    throw err;
  }

  try {
    if (response.status === 401) handleSessionExpired();
    if (!response.ok) {
      throw await parseErrorResponse(response, `Chat error (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to read chat SSE stream.");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned.startsWith("data: ")) continue;

        const data = cleaned.slice(6);
        if (data === "[DONE]") {
          options.onDone();
          return;
        }

        try {
          const chunk = JSON.parse(data);
          if (chunk.text) options.onChunk(chunk.text);
          if (chunk.error) throw errorFromPayload(chunk, "Chat failed");
        } catch (e: unknown) {
          if (e instanceof Error && !e.message.includes("JSON")) throw e;
        }
      }
    }
    options.onDone();
  } finally {
    timeout.cleanup();
  }
}

export const aiService = {
  /** Fetch server-configured providers (no API keys exposed) */
  fetchProviders: async (): Promise<ProviderListResponse> => {
    if (!BACKEND_URL) {
      return { providers: [], defaultProvider: "" };
    }
    const res = await fetch(`${BACKEND_URL}/api/ai/providers`);
    if (!res.ok) throw new Error("Failed to fetch providers");
    const json = await res.json();
    return json.data ?? { providers: [], defaultProvider: "" };
  },

  generateStream: async (options: GenerateStreamOptions): Promise<void> => {
    const provider = resolveProvider(options);
    const model = resolveModel({ ...options, provider });

    if (!BACKEND_URL) {
      throw new Error(
        "Backend URL is not configured. Set NEXT_PUBLIC_API_URL in frontend/.env.local"
      );
    }

    await withClientRetry(
      () =>
        streamBackendGenerate(
          options.prompt,
          options.onProgress,
          options.onProviderError,
          options.signal,
          provider,
          model,
          options.timeoutMs
        ),
      options.maxRetries ?? 2,
      options.signal
    );
  },

  improvePrompt: async (prompt: string): Promise<string> => {
    if (!BACKEND_URL) return prompt;

    const res = await fetch(`${BACKEND_URL}/api/ai/improve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Prompt improvement failed: ${res.statusText}${errText ? ` - ${errText}` : ""}`);
    }

    const json = await res.json();
    return json?.data?.prompt ?? json?.prompt ?? prompt;
  },

  chatStream: async (options: ChatStreamOptions): Promise<void> => {
    if (!BACKEND_URL) {
      throw new Error("Backend URL is not configured. Chat requires server-side streaming.");
    }
    await withClientRetry(
      () => streamChatBackend(options),
      options.maxRetries ?? 2,
      options.signal
    );
  },
};

// Backward compatibility export
export const CODEZEN_SUPPORTED_MODELS = [
  "codezen-1",
  "gpt-5-mini",
  "gpt-5-nano",
  "claude-opus-4-7",
  "gemini-3.1-flash-lite-preview",
];
