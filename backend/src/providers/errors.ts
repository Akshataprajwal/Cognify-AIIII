export type ProviderErrorCode =
  | "PROVIDER_CONFIG_ERROR"
  | "PROVIDER_INIT_ERROR"
  | "MODEL_VALIDATION_ERROR"
  | "PROVIDER_ERROR"
  | "AUTH_ERROR"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "ABORTED";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly statusCode?: number;
  readonly provider: string;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: {
      code?: ProviderErrorCode;
      statusCode?: number;
      provider: string;
      retryable?: boolean;
    }
  ) {
    super(message);
    this.name = "ProviderError";
    this.code = options.code ?? "PROVIDER_ERROR";
    this.statusCode = options.statusCode;
    this.provider = options.provider;
    this.retryable = options.retryable ?? false;
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      provider: this.provider,
      statusCode: this.statusCode,
      retryable: this.retryable,
    };
  }
}

const STATUS_MESSAGES: Record<number, { code: ProviderErrorCode; retryable: boolean; message: string }> = {
  400: { code: "PROVIDER_CONFIG_ERROR", retryable: false, message: "Provider rejected the request configuration." },
  401: { code: "AUTH_ERROR", retryable: false, message: "API key is invalid or expired." },
  403: { code: "FORBIDDEN", retryable: false, message: "API access forbidden. Check key permissions." },
  404: { code: "NOT_FOUND", retryable: false, message: "API endpoint or model not found." },
  429: { code: "RATE_LIMIT", retryable: true, message: "Rate limit exceeded. Please wait and retry." },
  500: { code: "SERVER_ERROR", retryable: true, message: "Provider internal server error." },
  502: { code: "SERVER_ERROR", retryable: true, message: "Provider gateway error." },
  503: { code: "SERVER_ERROR", retryable: true, message: "Provider service temporarily unavailable." },
};

function extractErrorDetail(body?: string): string {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body);
    const message = parsed?.error?.message || parsed?.message;
    const status = parsed?.error?.status || parsed?.status;
    if (message && status) return `${status}: ${message}`;
    if (message) return String(message);
  } catch {
    // Fall through to plain body text.
  }
  return body.slice(0, 500);
}

export function classifyHttpError(
  provider: string,
  status: number,
  body?: string
): ProviderError {
  const known = STATUS_MESSAGES[status];
  const extractedDetail = extractErrorDetail(body);
  const detail = extractedDetail ? ` ${extractedDetail}` : "";
  const lowerDetail = extractedDetail.toLowerCase();
  if (
    status === 400 &&
    (lowerDetail.includes("api key not valid") ||
      lowerDetail.includes("api_key_invalid") ||
      lowerDetail.includes("invalid api key") ||
      lowerDetail.includes("permission_denied"))
  ) {
    return new ProviderError(`[${provider}] API key is invalid or not authorized.${detail}`, {
      code: "AUTH_ERROR",
      statusCode: status,
      provider,
      retryable: false,
    });
  }
  if (known) {
    return new ProviderError(`[${provider}] ${known.message}${detail}`, {
      code: known.code,
      statusCode: status,
      provider,
      retryable: known.retryable,
    });
  }
  return new ProviderError(`[${provider}] HTTP ${status}.${detail}`, {
    code: "PROVIDER_ERROR",
    statusCode: status,
    provider,
    retryable: status >= 500,
  });
}

export function classifyNetworkError(provider: string, err: unknown): ProviderError {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("AbortError") || (err as any)?.name === "AbortError") {
    return new ProviderError(`[${provider}] Request aborted.`, {
      code: "ABORTED",
      provider,
      retryable: false,
    });
  }
  if (message.toLowerCase().includes("timeout")) {
    return new ProviderError(`[${provider}] Request timed out.`, {
      code: "TIMEOUT",
      provider,
      retryable: true,
    });
  }
  return new ProviderError(`[${provider}] Network error: ${message}`, {
    code: "NETWORK_ERROR",
    provider,
    retryable: true,
  });
}

export function createConfigError(provider: string, envKey: string): ProviderError {
  return new ProviderError(
    `[ProviderFactory] ${provider} requested but ${envKey} is not configured. Set ${envKey} in backend .env.`,
    { code: "PROVIDER_CONFIG_ERROR", provider, retryable: false }
  );
}
