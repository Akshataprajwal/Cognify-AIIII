"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authService, RegisterPayload, LoginPayload, TwoFactorChallengeResponse } from "@/services/authService";

/** Syncs the JWT token to a short-lived cookie so Next.js Edge middleware can read it. */
function setCookieToken(token: string) {
  document.cookie = `cognify-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

function clearCookieToken() {
  document.cookie = "cognify-token=; path=/; max-age=0";
}

export function useAuth() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { user, token } = await authService.register(payload);
      setAuth(user, token);
      setCookieToken(token);
      router.push(user.role === "ADMIN" ? "/admin" : "/dashboard");
    },
    [setAuth, router]
  );

  /**
   * Initiates login. Returns a TwoFactorChallengeResponse when admin 2FA is required;
   * otherwise logs the user in directly and navigates to the dashboard.
   */
  const login = useCallback(
    async (
      payload: LoginPayload,
      preferredRole: "USER" | "ADMIN" = "USER"
    ): Promise<TwoFactorChallengeResponse | null> => {
      const result = await authService.login(payload);

      // Admin 2FA required — caller (LoginForm) handles the challenge UI
      if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
        return result as TwoFactorChallengeResponse;
      }

      // Normal user login — set auth and navigate
      const authResult = result as import("@/services/authService").AuthResponse;
      const { user, token } = authResult;
      setAuth(user, token);
      setCookieToken(token);
      if (preferredRole === "ADMIN" && user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

      return null;
    },
    [setAuth, router]
  );

  /**
   * Completes admin 2FA. tempToken is passed in component state — never stored.
   */
  const adminVerifyCode = useCallback(
    async (tempToken: string, code: string) => {
      const { user, token } = await authService.adminVerifyCode(tempToken, code);
      setAuth(user, token);
      setCookieToken(token);
      router.push("/admin");
    },
    [setAuth, router]
  );

  const logout = useCallback(() => {
    clearAuth();
    clearCookieToken();
    router.push("/login");
  }, [clearAuth, router]);

  return { user, token, isAuthenticated, register, login, adminVerifyCode, logout };
}
