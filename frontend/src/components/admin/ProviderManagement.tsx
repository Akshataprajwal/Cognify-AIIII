"use client";

import { useEffect, useState } from "react";
import {
  Power,
  PowerOff,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";
import { API_BASE } from "@/lib/api";

interface ProviderStats {
  id: string;
  provider: string;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  lastUsedAt: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ProviderManagement() {
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [providers, setProviders] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingProviderName, setTogglingProviderName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchProviders();
  }, [token]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch<{ providers: ProviderStats[] }>(
        "/api/admin/providers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProviders(data.providers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProvider = async (
    provider: string,
    currentStatus: boolean
  ) => {
    try {
      setTogglingProviderName(provider);
      const response = await fetch(
        `${API_BASE}/api/admin/providers/${provider}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isEnabled: !currentStatus }),
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Admin privileges required.");
        }
        throw new Error("Failed to update provider status");
      }

      setProviders((prev) =>
        prev.map((p) =>
          p.provider === provider ? { ...p, isEnabled: !currentStatus } : p
        )
      );

      toast({
        title: "Provider status updated",
        description: `Successfully ${!currentStatus ? "enabled" : "disabled"} ${providerNames[provider] || provider}.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error updating provider",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "error",
      });
    } finally {
      setTogglingProviderName(null);
    }
  };

  const providerColors: Record<string, string> = {
    gemini: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
    openai: "text-green-400 bg-green-500/10 ring-green-500/20",
    anthropic: "text-orange-400 bg-orange-500/10 ring-orange-500/20",
    openrouter: "text-purple-400 bg-purple-500/10 ring-purple-500/20",
    groq: "text-pink-400 bg-pink-500/10 ring-pink-500/20",
    unknown: "text-gray-400 bg-gray-500/10 ring-gray-500/20",
  };

  const providerNames: Record<string, string> = {
    gemini: "Google Gemini",
    openai: "OpenAI GPT",
    anthropic: "Anthropic Claude",
    openrouter: "OpenRouter",
    groq: "Groq",
    codezen: "CodeZen",
  };

  const hasResults = providers.length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-72 rounded-lg" />
            <div className="mt-2">
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-[260px] rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
        <Button onClick={fetchProviders} variant="outline" className="focus-visible:ring-2 focus-visible:ring-primary-500">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Provider Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage AI provider performance
          </p>
        </div>
        <Button
          onClick={fetchProviders}
          variant="outline"
          size="sm"
          aria-label="Refresh providers"
          className="focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* Provider Cards */}
      {!hasResults ? (
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            No provider data available
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
            Try refreshing or check provider connectivity.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {providerNames[provider.provider] || provider.provider}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${
                      providerColors[provider.provider] || providerColors.unknown
                    }`}
                  >
                    {provider.provider}
                  </span>
                </div>

                <button
                  onClick={() =>
                    handleToggleProvider(provider.provider, provider.isEnabled)
                  }
                  disabled={togglingProviderName !== null}
                  aria-label={
                    provider.isEnabled
                      ? `Disable ${provider.provider}`
                      : `Enable ${provider.provider}`
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-60 ${
                    provider.isEnabled
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
                  }`}
                  title={provider.isEnabled ? "Disable provider" : "Enable provider"}
                  type="button"
                >
                  {togglingProviderName === provider.provider ? (
                    <Spinner size="xs" />
                  ) : provider.isEnabled ? (
                    <Power className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <PowerOff className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">
                    Total Requests
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {provider.totalRequests.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">
                    Success Rate
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {provider.totalRequests > 0
                      ? Math.round(
                          (provider.successCount / provider.totalRequests) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">
                    Avg Response
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {provider.avgResponseTime}ms
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">
                    Failures
                  </p>
                  <p className="text-sm font-medium text-red-400">
                    {provider.failureCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>
                  Last used:{" "}
                  {provider.lastUsedAt
                    ? new Date(provider.lastUsedAt).toLocaleString()
                    : "Never"}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-white/[0.06]">
                {provider.isEnabled ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />
                )}
                <span className="text-xs text-gray-600 dark:text-white/40">
                  {provider.isEnabled ? "Provider is enabled" : "Provider is disabled"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
