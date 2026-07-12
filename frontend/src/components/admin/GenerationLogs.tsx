"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";
import { API_BASE } from "@/lib/api";

interface Generation {
  id: string;
  prompt: string;
  provider: string;
  durationMs: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function GenerationLogs() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal deletion state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (token) {
      fetchGenerations();
    }
  }, [token, page, debouncedSearch, statusFilter, providerFilter]);

  const fetchGenerations = async () => {
    const isFirst = generations.length === 0;
    try {
      if (isFirst) {
        setIsInitialLoading(true);
      } else {
        setIsBackgroundLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter) params.append("status", statusFilter);
      if (providerFilter) params.append("provider", providerFilter);

      const data = await apiFetch<{ generations: Generation[]; pagination: PaginationInfo }>(
        `/api/admin/generations?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGenerations(data.generations ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsInitialLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const requestDeleteLog = (generationId: string) => {
    setDeleteLogId(generationId);
    setDeleteOpen(true);
  };

  const confirmDeleteLog = async () => {
    if (!deleteLogId) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_BASE}/api/admin/generations/${deleteLogId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete generation log");
      }

      setDeleteOpen(false);
      setDeleteLogId(null);
      toast({
        title: "Log deleted",
        description: "The generation log has been successfully deleted.",
        variant: "success",
      });
      await fetchGenerations();
    } catch (err) {
      toast({
        title: "Error deleting log",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied",
      description: "Copied generation prompt to clipboard.",
      variant: "success",
    });
  };

  const statusColors: Record<string, string> = {
    SUCCESS: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    FAILED: "text-red-400 bg-red-500/10 ring-red-500/20",
    PENDING: "text-yellow-400 bg-yellow-500/10 ring-yellow-500/20",
  };

  const providerColors: Record<string, string> = {
    unknown: "text-gray-400 bg-gray-500/10 ring-gray-500/20",
    gemini: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
    openai: "text-green-400 bg-green-500/10 ring-green-500/20",
    anthropic: "text-orange-400 bg-orange-500/10 ring-orange-500/20",
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="mt-2">
              <Skeleton className="h-4 w-72 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Generation Logs</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage AI generation history</p>
          </div>
          {isBackgroundLoading && <Spinner size="sm" className="mt-1" />}
        </div>
        <Button onClick={fetchGenerations} variant="outline" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary-500" aria-label="Refresh logs">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <p>{error}</p>
          <Button onClick={fetchGenerations} variant="outline" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary-500">
            Retry
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by prompt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Search prompts"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Filter by provider"
        >
          <option value="">All Providers</option>
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </div>

      {/* Generations Table */}
      <div className={`space-y-0 transition-opacity duration-200 ${isBackgroundLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">Prompt</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 sm:table-cell">Provider</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 md:table-cell">Status</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30 lg:table-cell">Duration</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 xl:table-cell">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {generations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        No generation logs found
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                        Try adjusting your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  generations.map((gen, i) => (
                    <tr
                      key={gen.id}
                      className={`group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        i !== generations.length - 1 ? "border-b border-gray-200 dark:border-white/[0.04]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-900 dark:text-white/80">{gen.user.name || gen.user.email}</p>
                        <p className="text-[10px] text-gray-500 dark:text-white/30">{gen.user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="truncate text-xs text-gray-900 dark:text-white/80 max-w-xs">{gen.prompt}</p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${providerColors[gen.provider] || providerColors.unknown}`}
                        >
                          {gen.provider}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${statusColors[gen.status] || statusColors.PENDING}`}
                        >
                          {gen.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-right text-xs text-gray-500 dark:text-white/40 lg:table-cell">
                        {gen.durationMs}ms
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-white/40 xl:table-cell">
                        {new Date(gen.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopyPrompt(gen.prompt)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            title="Copy prompt"
                            aria-label={`Copy prompt for log ${gen.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => requestDeleteLog(gen.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            title="Delete log"
                            aria-label={`Delete log ${gen.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/[0.04] px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-white/25">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog
        open={deleteOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setDeleteLogId(null);
          }
        }}
        onConfirm={confirmDeleteLog}
        title="Delete generation log?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
