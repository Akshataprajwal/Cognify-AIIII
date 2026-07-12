"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms — default 4000, 0 = persistent
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ duration = 4000, ...opts }: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, duration, ...opts }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Viewport (renders toasts) ───────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { icon: ReactNode; accent: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />,
    accent: "border-l-emerald-500",
  },
  error: {
    icon: <XCircle className="h-4 w-4 shrink-0 text-red-400" />,
    accent: "border-l-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />,
    accent: "border-l-amber-500",
  },
  info: {
    icon: <Info className="h-4 w-4 shrink-0 text-indigo-400" />,
    accent: "border-l-indigo-500",
  },
};

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast: t,
  dismiss,
}: {
  toast: Toast;
  dismiss: (id: string) => void;
}) {
  const variant = t.variant ?? "info";
  const { icon, accent } = variantConfig[variant];
  const ref = useRef<HTMLDivElement>(null);

  // Slide-in animation class via inline style
  return (
    <div
      ref={ref}
      role="alert"
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-xl border border-l-4 border-white/[0.08] bg-[#111118] p-4 shadow-2xl shadow-black/60 animate-in slide-in-from-right-4 fade-in duration-300 ${accent}`}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{t.title}</p>
        {t.description && (
          <p className="mt-0.5 text-xs text-white/40 leading-relaxed">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(t.id)}
        aria-label="Dismiss notification"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/30 transition-colors hover:text-white/60"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
