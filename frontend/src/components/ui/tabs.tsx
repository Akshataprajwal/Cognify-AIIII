"use client";

import { type ReactNode, useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  /** "line" | "pill" — visual style */
  variant?: "line" | "pill";
  className?: string;
}

export function Tabs({ tabs, defaultTab, variant = "line", className = "" }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab list */}
      <div
        role="tablist"
        className={`flex items-center gap-1 ${
          variant === "pill"
            ? "rounded-xl bg-white/[0.04] p-1"
            : "border-b border-white/[0.06]"
        }`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none ${
                variant === "pill"
                  ? isActive
                    ? "rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "rounded-lg text-white/40 hover:text-white/70"
                  : isActive
                  ? "text-indigo-400"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.icon && (
                <span className="flex h-4 w-4 items-center justify-center">{tab.icon}</span>
              )}
              {tab.label}
              {/* Underline indicator for line variant */}
              {variant === "line" && isActive && (
                <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      {activeTab && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          className="mt-5"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
