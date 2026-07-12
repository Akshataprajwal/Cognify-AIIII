"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Renders a visual separator ABOVE this item */
  separator?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  /** "left" | "right" — where the menu aligns relative to the trigger */
  align?: "left" | "right";
  /** Show a small chevron next to the trigger text */
  withChevron?: boolean;
}

export function Dropdown({ trigger, items, align = "left", withChevron = false }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5"
      >
        {trigger}
        {withChevron && (
          <ChevronDown
            className={`h-3.5 w-3.5 text-white/40 transition-transform duration-200 ${
              open ? "-rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Menu */}
      {open && (
        <div
          role="menu"
          className={`absolute top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-white/[0.08] bg-[#111118] py-1 shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && (
                <div className="my-1 border-t border-white/[0.06]" role="separator" />
              )}
              <button
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                  item.disabled
                    ? "cursor-not-allowed text-white/20"
                    : item.danger
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {item.icon && (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
