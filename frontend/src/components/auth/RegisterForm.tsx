"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strengthLevel = strength.filter(Boolean).length;
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][strengthLevel - 1] ?? "";
  const strengthColor = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"][
    strengthLevel - 1
  ] ?? "bg-white/10";

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role ?? "USER",
      });
      toast.success("Account created! Welcome to Cognify AI.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-indigo-500/30">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-white/50">
          Start building stunning UIs with AI
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="reg-role" className="text-sm font-medium text-white/70">
            Account type
          </label>
          <select
            id="reg-role"
            {...register("role")}
            className={`w-full rounded-xl border bg-white/[0.05] py-3 px-4 text-sm text-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
              errors.role
                ? "border-red-500/50"
                : "border-white/[0.08] focus:border-indigo-500/50"
            }`}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-400">{errors.role.message}</p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="text-sm font-medium text-white/70">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              {...register("name")}
              className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                errors.name
                  ? "border-red-500/50"
                  : "border-white/[0.08] focus:border-indigo-500/50"
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-sm font-medium text-white/70">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                errors.email
                  ? "border-red-500/50"
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
          <label htmlFor="reg-password" className="text-sm font-medium text-white/70">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register("password")}
              className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                errors.password
                  ? "border-red-500/50"
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
          {/* Password strength meter */}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < strengthLevel ? strengthColor : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-white/40">
                Strength:{" "}
                <span
                  className={`font-medium ${
                    strengthLevel >= 3 ? "text-emerald-400" : "text-orange-400"
                  }`}
                >
                  {strengthLabel}
                </span>
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="reg-confirm" className="text-sm font-medium text-white/70">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...register("confirmPassword")}
              className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-11 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${
                errors.confirmPassword
                  ? "border-red-500/50"
                  : "border-white/[0.08] focus:border-indigo-500/50"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={isSubmitting}
          className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </span>
          ) : (
            "Create free account"
          )}
        </button>

        <p className="text-center text-xs text-white/30">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
