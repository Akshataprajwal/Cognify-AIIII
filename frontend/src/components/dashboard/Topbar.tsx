"use client";

import { Bell, Search, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function Topbar() {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0f]/80 px-6 backdrop-blur-md">
      {/* Left — greeting */}
      <div>
        <p className="text-sm font-medium text-white/80">
          {greeting},{" "}
          <span className="text-white">{user?.name ?? "there"}</span>
          <span className="ml-1 text-white/40">👋</span>
        </p>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-white/30">
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search…</span>
          <kbd className="ml-4 hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/20 sm:block">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-white/40 transition-all hover:border-indigo-500/40 hover:text-indigo-400"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* New project CTA */}
        <Link
          href="/ai-workspace"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:block">New project</span>
        </Link>
      </div>
    </header>
  );
}
