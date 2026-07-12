"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  LayoutTemplate,
  History,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    group: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/ai-workspace", label: "AI Workspace", icon: Sparkles },
      { href: "/projects", label: "Projects", icon: FolderOpen },
      { href: "/templates", label: "Templates", icon: LayoutTemplate },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/history", label: "History", icon: History },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/admin", label: "Admin", icon: Shield },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-white/[0.06] bg-[#0a0a0f] transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/[0.06] px-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg">
            C
          </span>
          {!collapsed && (
            <span className="truncate bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-sm font-bold text-transparent">
              Cognify AI
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3 py-4">
        {navItems.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={collapsed ? label : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-indigo-500/15 text-indigo-400 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
                          : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          active ? "text-indigo-400" : "text-white/30 group-hover:text-white/60"
                        }`}
                      />
                      {!collapsed && <span className="truncate">{label}</span>}
                      {active && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/[0.06] p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white/80">
                {user.name ?? "User"}
              </p>
              <p className="truncate text-[10px] text-white/30">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title="Sign out"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0a0f] text-white/40 shadow-sm transition-all hover:border-indigo-500/40 hover:text-indigo-400"
      >
        <ChevronLeft
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>
    </aside>
  );
}
