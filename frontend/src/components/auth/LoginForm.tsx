"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AdminTwoFactorForm } from "./AdminTwoFactorForm";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** Holds the state needed to display and resend the 2FA challenge. */
interface TwoFactorState {
  tempToken: string;
  credentials: { email: string; password: string };
}

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [dashboardRole, setDashboardRole] = useState<"USER" | "ADMIN">("USER");
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorState | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("expired") === "true") {
        // Use timeout to ensure toast is loaded cleanly after mount
        const t = setTimeout(() => {
          toast.error("Your session has expired. Please log in again.", { duration: 6000 });
        }, 100);
        // Clean url query parameter to keep URL clean
        window.history.replaceState({}, document.title, window.location.pathname);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data, dashboardRole);

      if (result && "requiresTwoFactor" in result && result.requiresTwoFactor) {
        // Admin 2FA required — switch to verification screen
        // Credentials kept in React state only for the resend flow
        setTwoFactorState({
          tempToken: result.tempToken,
          credentials: { email: data.email, password: data.password },
        });
        return;
      }

      toast.success("Welcome back!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(message);
    }
  };

  // ─── Admin 2FA verification screen ────────────────────────────────────────
  if (twoFactorState) {
    return (
      <AdminTwoFactorForm
        tempToken={twoFactorState.tempToken}
        credentials={twoFactorState.credentials}
        onCancel={() => setTwoFactorState(null)}
      />
    );
  }

  // ─── Normal login form ────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-indigo-500/30">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50">
          Sign in to your Cognify AI account
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-white/70 mb-3">Sign in to</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDashboardRole("USER")}
            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
              dashboardRole === "USER"
                ? "border-indigo-400 bg-indigo-500/10 text-white"
                : "border-white/[0.08] bg-white/[0.04] text-white/70 hover:border-indigo-400"
            }`}
          >
            User Dashboard
          </button>
          <button
            type="button"
            onClick={() => setDashboardRole("ADMIN")}
            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
              dashboardRole === "ADMIN"
                ? "border-indigo-400 bg-indigo-500/10 text-white"
                : "border-white/[0.08] bg-white/[0.04] text-white/70 hover:border-indigo-400"
            }`}
          >
            Admin Dashboard
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-white/70">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                errors.email
                  ? "border-red-500/50 focus:border-red-500/50"
                  : "border-white/[0.08] focus:border-indigo-500/50"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-white/70">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                errors.password
                  ? "border-red-500/50 focus:border-red-500/50"
                  : "border-white/[0.08] focus:border-indigo-500/50"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isSubmitting}
          className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
