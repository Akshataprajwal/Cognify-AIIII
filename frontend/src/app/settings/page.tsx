"use client";

import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Key,
  AlertTriangle,
  Camera,
  Save,
  RefreshCw,
  Trash2,
  Moon,
  Sun,
  Server,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { ProviderSelector } from "@/components/workspace/ProviderSelector";
import { API_BASE } from "@/lib/api";
import { FALLBACK_PROVIDERS } from "@/lib/providerConfig";

type SettingsTab = "profile" | "security" | "notifications" | "api" | "danger";

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="h-3.5 w-3.5" /> },
  { id: "security", label: "Security", icon: <Lock className="h-3.5 w-3.5" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5" /> },
  { id: "api", label: "API Keys", icon: <Key className="h-3.5 w-3.5" /> },
  { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [serverProviders, setServerProviders] = useState<string[]>([]);
  const [notifs, setNotifs] = useState({
    email_generation: true,
    email_billing: true,
    email_updates: false,
    browser_push: false,
  });

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/ai/providers`)
      .then((r) => r.json())
      .then((data) => {
        const ids = (data?.data?.providers ?? []).map((p: { id: string }) => p.id);
        setServerProviders(ids);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/40">
          Manage your account preferences and security
        </p>
      </div>

      {/* Tab layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Vertical tab list */}
        <aside className="flex shrink-0 flex-row gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 lg:w-48 lg:flex-col">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`settings-tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? tab.id === "danger"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-indigo-500/15 text-indigo-400"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Panel */}
        <div className="flex-1 min-w-0">
          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6">
                <h2 className="mb-5 text-sm font-semibold text-white">Public Profile</h2>

                {/* Avatar */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    <Avatar name="Alex Johnson" size="xl" />
                    <button
                      aria-label="Upload avatar"
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-[#111118] text-white/50 transition-colors hover:text-white/80"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Alex Johnson</p>
                    <p className="text-xs text-white/40">alex@example.com</p>
                    <button className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Change photo
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { id: "full-name", label: "Full Name", value: "Alex Johnson", type: "text" },
                    { id: "username", label: "Username", value: "alexj", type: "text" },
                    { id: "email", label: "Email", value: "alex@example.com", type: "email" },
                    { id: "website", label: "Website", value: "", type: "url", placeholder: "https://yoursite.com" },
                  ].map((f) => (
                    <div key={f.id} className="flex flex-col gap-1.5">
                      <label htmlFor={f.id} className="text-xs font-medium text-white/50">
                        {f.label}
                      </label>
                      <input
                        id={f.id}
                        type={f.type}
                        defaultValue={f.value}
                        placeholder={f.placeholder}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label htmlFor="bio" className="text-xs font-medium text-white/50">Bio</label>
                    <textarea
                      id="bio"
                      rows={3}
                      placeholder="Tell us a little about yourself…"
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    id="save-profile-btn"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
                  >
                    <Save className="h-4 w-4" />
                    Save changes
                  </button>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 mt-6">
                <h2 className="text-sm font-semibold text-white">Interface Theme</h2>
                <p className="mt-0.5 text-xs text-white/40">Select your preferred color mode for the platform</p>
                
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                      theme === "dark"
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400 font-bold"
                        : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark Mode
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                      theme === "light"
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400 font-bold"
                        : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light Mode
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                      theme === "system"
                        ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400 font-bold"
                        : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    System Default
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6">
                <h2 className="mb-5 text-sm font-semibold text-white">Change Password</h2>
                <div className="space-y-4">
                  {[
                    { id: "current-password", label: "Current Password" },
                    { id: "new-password", label: "New Password" },
                    { id: "confirm-password", label: "Confirm New Password" },
                  ].map((f) => (
                    <div key={f.id} className="flex flex-col gap-1.5">
                      <label htmlFor={f.id} className="text-xs font-medium text-white/50">
                        {f.label}
                      </label>
                      <input
                        id={f.id}
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end pt-1">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                      <Lock className="h-4 w-4" />
                      Update password
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Two-Factor Authentication</h3>
                    <p className="mt-0.5 text-xs text-white/40">Add an extra layer of security to your account</p>
                  </div>
                  <button className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-400 transition-all hover:bg-indigo-500/20">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white">Notification Preferences</h2>
              {[
                { id: "email_generation" as const, label: "Generation complete", desc: "Get notified when an AI generation finishes" },
                { id: "email_billing" as const, label: "Billing & invoices", desc: "Receive invoices and billing alerts" },
                { id: "email_updates" as const, label: "Product updates", desc: "Hear about new features and improvements" },
                { id: "browser_push" as const, label: "Browser notifications", desc: "Push notifications in supported browsers" },
              ].map((item) => (
                <label
                  key={item.id}
                  htmlFor={`notif-${item.id}`}
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.035]"
                >
                  <div>
                    <p className="text-sm font-medium text-white/80">{item.label}</p>
                    <p className="mt-0.5 text-xs text-white/30">{item.desc}</p>
                  </div>
                  {/* Toggle */}
                  <div className="relative shrink-0 mt-0.5">
                    <input
                      id={`notif-${item.id}`}
                      type="checkbox"
                      className="peer sr-only"
                      checked={notifs[item.id]}
                      onChange={() =>
                        setNotifs((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                    />
                    <div className="h-5 w-9 rounded-full bg-white/[0.08] transition-colors peer-checked:bg-indigo-600" />
                    <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/40 shadow transition-all peer-checked:left-[18px] peer-checked:bg-white" />
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* ── API KEYS ── */}
          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-white">AI Provider & Model</h2>
                  <p className="mt-0.5 text-xs text-white/40">
                    Choose which provider and model generate your code. API keys are stored
                    server-side only — never in the browser.
                  </p>
                </div>
                <ProviderSelector />
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white">Server-Configured Providers</h2>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">
                  Add API keys to <code className="text-indigo-300">backend/.env</code> and restart
                  the backend. Supported free-tier providers: Groq, Gemini, OpenRouter, Together AI,
                  DeepSeek.
                </p>
                <div className="flex flex-wrap gap-2">
                  {FALLBACK_PROVIDERS.map((p) => {
                    const configured = serverProviders.includes(p.id);
                    return (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          configured
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-white/[0.03] text-white/30 border border-white/[0.06]"
                        }`}
                      >
                        {p.name}
                        {p.freeTier && <span className="text-[9px] opacity-60">free</span>}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
                <div className="flex items-start gap-2.5">
                  <Key className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-200">Security</h3>
                    <p className="mt-1 text-xs text-white/40 leading-relaxed">
                      API keys must only be set in <code className="text-amber-300">backend/.env</code>.
                      They are never sent to the browser, stored in localStorage, or embedded in frontend code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeTab === "danger" && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h2 className="text-sm font-semibold text-red-300">Danger Zone</h2>
              </div>
              <p className="text-xs text-white/35 leading-relaxed">
                These actions are irreversible. Please be absolutely certain before proceeding.
              </p>

              <div className="space-y-3">
                {[
                  {
                    title: "Delete all projects",
                    desc: "Permanently delete all your projects and generated code. This cannot be undone.",
                    id: "delete-projects-btn",
                    label: "Delete projects",
                  },
                  {
                    title: "Delete account",
                    desc: "Permanently close your account. All data will be erased and you will lose access immediately.",
                    id: "delete-account-btn",
                    label: "Delete account",
                  },
                ].map((action) => (
                  <div
                    key={action.id}
                    className="flex flex-col gap-3 rounded-xl border border-red-500/10 bg-red-500/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white/70">{action.title}</p>
                      <p className="mt-0.5 text-xs text-white/30">{action.desc}</p>
                    </div>
                    <button
                      id={action.id}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {action.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
