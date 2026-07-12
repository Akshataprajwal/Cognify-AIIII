import { API_BASE } from "@/lib/api";

export interface BackendErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: unknown;
}

export interface BackendSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export type BackendResponse<T = unknown> = BackendSuccessResponse<T> | BackendErrorResponse | T;

export function parseResponseBody(res: Response, body: unknown) {
  if (body && typeof body === "object" && "success" in body) {
    const payload = body as BackendResponse;
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      if ((payload as BackendErrorResponse).success === false) {
        const errorPayload = payload as BackendErrorResponse;
        throw new Error(errorPayload.error || res.statusText || "Request failed");
      }
      if ((payload as BackendSuccessResponse).success === true) {
        const successPayload = payload as BackendSuccessResponse;
        return successPayload.data as unknown;
      }
    }
  }

  return body;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && options.method !== "GET" && options.method !== "HEAD") {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Authorization") && typeof window !== "undefined") {
    const token = localStorage.getItem("cognify-auth-token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const init: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${path}`, init);
  const text = await response.text();
  let body: unknown;

  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }

  if (!response.ok) {
    if (body && typeof body === "object" && "error" in (body as Record<string, unknown>)) {
      const err = body as BackendErrorResponse;
      throw new Error(err.error || response.statusText);
    }
    throw new Error(response.statusText || "Request failed");
  }

  return parseResponseBody(response, body) as T;
}
