import { API_BASE } from "@/lib/api";
import { BackendResponse } from "@/lib/apiRequest";

export interface RegisterPayload {
  name?: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    role?: "USER" | "ADMIN";
  };
  token: string;
  refreshToken?: string;
}

/** Returned when the backend requires admin 2FA before issuing the full JWT. */
export interface TwoFactorChallengeResponse {
  requiresTwoFactor: true;
  tempToken: string;
  message: string;
}

export type LoginResponse = AuthResponse | TwoFactorChallengeResponse;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      // Clear authentication cookies
      document.cookie = "cognify-token=; path=/; max-age=0";
      document.cookie = "cognify-role=; path=/; max-age=0";
      // Clear localStorage auth state
      localStorage.removeItem("cognify-auth-token");
      localStorage.removeItem("cognify-auth-refresh-token");
      localStorage.removeItem("cognify-auth-user");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?expired=true&from=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    throw new Error("Session expired. Please log in again.");
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (data && typeof data === "object" && "error" in (data as Record<string, unknown>)) {
      throw new Error((data as { error?: string }).error || res.statusText || "Something went wrong");
    }
    throw new Error(res.statusText || "Something went wrong");
  }

  if (data && typeof data === "object" && "success" in data) {
    const payload = data as any;
    if (payload.success === false) {
      throw new Error(payload.error || res.statusText || "Request failed");
    }
    return payload.data as T;
  }

  return data as T;
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const data = await request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Set cookies for Next.js middleware route protection
    document.cookie = `cognify-token=${data.token}; path=/; max-age=604800`; // 7 days
    if (data.user.role) {
      document.cookie = `cognify-role=${data.user.role}; path=/; max-age=604800`;
    }

    // Also persist to localStorage so aiService can attach Bearer token on API calls
    localStorage.setItem("cognify-auth-token", data.token);
    localStorage.setItem("cognify-auth-user", JSON.stringify(data.user));

    return data;
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const data = await request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Only set cookies when we received a full auth response (not a 2FA challenge)
    if (!("requiresTwoFactor" in data && data.requiresTwoFactor)) {
      const authData = data as AuthResponse;
      // Set cookie for Next.js middleware route protection
      document.cookie = `cognify-token=${authData.token}; path=/; max-age=604800`;
      if (authData.user.role) {
        document.cookie = `cognify-role=${authData.user.role}; path=/; max-age=604800`;
      }
      // Also persist to localStorage so aiService can attach Bearer token on API calls
      localStorage.setItem("cognify-auth-token", authData.token);
      localStorage.setItem("cognify-auth-user", JSON.stringify(authData.user));
    }

    return data;
  },

  /**
   * Submits the 6-digit 2FA code together with the temp token.
   * On success the server returns a full AuthResponse.
   * tempToken is passed only in memory — never stored in localStorage/sessionStorage.
   */
  adminVerifyCode: async (tempToken: string, code: string): Promise<AuthResponse> => {
    const data = await request<AuthResponse>("/api/auth/admin/verify-code", {
      method: "POST",
      body: JSON.stringify({ tempToken, code }),
    });

    // Set cookie for Next.js middleware route protection
    document.cookie = `cognify-token=${data.token}; path=/; max-age=604800`;
    if (data.user.role) {
      document.cookie = `cognify-role=${data.user.role}; path=/; max-age=604800`;
    }
    // Also persist to localStorage so aiService can attach Bearer token on API calls
    localStorage.setItem("cognify-auth-token", data.token);
    localStorage.setItem("cognify-auth-user", JSON.stringify(data.user));

    return data;
  },

  logout: async () => {
    try {
      await request("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("cognify-auth-token")}` },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear cookies
      document.cookie = "cognify-token=; path=/; max-age=0";
      document.cookie = "cognify-role=; path=/; max-age=0";

      // Clear all localStorage auth entries
      localStorage.removeItem("cognify-auth-token");
      localStorage.removeItem("cognify-auth-refresh-token");
      localStorage.removeItem("cognify-auth-user");
    }
  },

  me: (token: string) =>
    request<{ user: AuthResponse["user"] }>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
