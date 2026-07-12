"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

type DialogVariant = "info" | "confirm" | "danger" | "success";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
}

const variantConfig: Record<
  DialogVariant,
  { icon: ReactNode; iconBg: string; confirmClass: string }
> = {
  info: {
    icon: <Info className="h-5 w-5 text-indigo-400" />,
    iconBg: "bg-indigo-500/10",
    confirmClass:
      "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20",
  },
  confirm: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    iconBg: "bg-emerald-500/10",
    confirmClass:
      "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20",
  },
  danger: {
    icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
    iconBg: "bg-red-500/10",
    confirmClass: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20",
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    iconBg: "bg-emerald-500/10",
    confirmClass:
      "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20",
  },
};

export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  isLoading = false,
}: DialogProps) {
  const { icon, iconBg, confirmClass } = variantConfig[variant];
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Auto-focus confirm button
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description && (
            <p className="mt-1.5 text-sm text-white/40">{description}</p>
          )}
        </div>
        <div className="flex w-full gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:border-white/[0.15] hover:text-white/80 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              ref={confirmRef}
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 ${confirmClass}`}
            >
              {isLoading ? "Loading…" : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
