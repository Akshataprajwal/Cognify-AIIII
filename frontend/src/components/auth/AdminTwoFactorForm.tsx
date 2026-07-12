"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { ShieldCheck, Loader2, RefreshCw, ArrowLeft, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  tempToken: string;
  /** Stored only in component state for resend; never written to storage */
  credentials: { email: string; password: string };
  onCancel: () => void;
}

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export function AdminTwoFactorForm({ tempToken, credentials, onCancel }: Props) {
  const { adminVerifyCode, login } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [activeTempToken, setActiveTempToken] = useState(tempToken);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5 * 60); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (success) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getCode = () => digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError(null);
    // Auto-advance
    if (cleaned && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      void handleVerify();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setError(null);
    // Focus the input after the last pasted digit
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = getCode();
    if (code.length !== CODE_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    if (countdown === 0) {
      setError("The code has expired. Please request a new one.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await adminVerifyCode(activeTempToken, code);
      setSuccess(true);
      // Navigation is handled by adminVerifyCode → router.push("/admin")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setError(message);
      // Clear digits on fatal errors (expired / locked)
      if (message.includes("expired") || message.includes("Too many")) {
        setDigits(Array(CODE_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  }, [activeTempToken, adminVerifyCode, countdown, digits]);

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      const result = await login(credentials, "ADMIN");
      if (result && "requiresTwoFactor" in result && result.requiresTwoFactor) {
        setActiveTempToken(result.tempToken);
        setDigits(Array(CODE_LENGTH).fill(""));
        setCountdown(5 * 60);
        setResendCooldown(RESEND_COOLDOWN);
        inputRefs.current[0]?.focus();
      } else {
        setError("Unexpected response. Please return to login.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  }, [credentials, login, resendCooldown, isResending]);

  const isCodeComplete = digits.every((d) => d !== "");
  const isExpired = countdown === 0;

  // ─── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/40 animate-pulse">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Authentication Successful</h2>
        <p className="text-sm text-white/50">Redirecting to admin dashboard…</p>
      </div>
    );
  }

  // ─── Main 2FA form ────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-all duration-300 ${
            isExpired
              ? "bg-red-500/20 ring-red-500/30"
              : "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-indigo-500/30"
          }`}
        >
          <ShieldCheck className={`h-6 w-6 ${isExpired ? "text-red-400" : "text-indigo-400"}`} />
        </div>
        <h1 className="text-2xl font-bold text-white">Admin Verification</h1>
        <p className="mt-1 text-sm text-white/50">
          A 6-digit code was sent to the server console.
          <br />
          Enter it below to access the admin dashboard.
        </p>
      </div>

      {/* Timer */}
      <div
        className={`mb-6 flex items-center justify-center gap-2 text-sm font-medium ${
          isExpired
            ? "text-red-400"
            : countdown < 60
            ? "text-amber-400"
            : "text-white/50"
        }`}
      >
        <Clock className="h-4 w-4" />
        {isExpired ? "Code expired" : `Expires in ${formatTime(countdown)}`}
      </div>

      {/* 6-digit code inputs */}
      <div className="mb-6 flex justify-center gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            id={`tfa-digit-${i}`}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={digit}
            disabled={isExpired || isVerifying}
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1} of 6`}
            className={`h-14 w-12 rounded-xl border text-center text-xl font-bold text-white outline-none transition-all duration-150 focus:ring-2 ${
              isExpired
                ? "border-red-500/30 bg-red-500/5 text-red-400 cursor-not-allowed"
                : digit
                ? "border-indigo-500/60 bg-indigo-500/10 focus:border-indigo-400 focus:ring-indigo-500/40"
                : "border-white/[0.08] bg-white/[0.04] focus:border-indigo-500/50 focus:ring-indigo-500/30"
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Verify button */}
      <button
        id="tfa-verify-btn"
        type="button"
        onClick={handleVerify}
        disabled={!isCodeComplete || isVerifying || isExpired}
        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isVerifying ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </span>
        ) : (
          "Verify Code"
        )}
      </button>

      {/* Resend + Cancel */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          id="tfa-cancel-btn"
          type="button"
          onClick={onCancel}
          disabled={isVerifying}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </button>

        <button
          id="tfa-resend-btn"
          type="button"
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0 || isVerifying}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : isResending
            ? "Sending…"
            : "Resend code"}
        </button>
      </div>

      {/* Security note */}
      <p className="mt-6 text-center text-xs text-white/25">
        This code expires in 5 minutes and can only be used once.
      </p>
    </div>
  );
}
