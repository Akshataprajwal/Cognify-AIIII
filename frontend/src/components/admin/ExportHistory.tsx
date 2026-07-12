"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  FileText,
  Code,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";
import { API_BASE } from "@/lib/api";

interface ExportHistory {
  id: string;
  type: "react" | "nextjs" | "html";
  projectId: string;
  projectName: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  downloadCount: number;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ExportHistory() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  
  const [exports, setExports] = useState<ExportHistory[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal deletion state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExportId, setDeleteExportId] = useState<string | null>(null);
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
      fetchExports();
    }
  }, [token, page, debouncedSearch, typeFilter]);

  const fetchExports = async () => {
    const isFirst = exports.length === 0;
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
      if (typeFilter) params.append("format", typeFilter);

      const response = await fetch(
        `${API_BASE}/api/admin/exports?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch export history");
      }

      const data = await response.json();
      setExports(data.exports ?? []);
      setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsInitialLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const requestDeleteExport = (exportId: string) => {
    setDeleteExportId(exportId);
    setDeleteOpen(true);
  };

  const confirmDeleteExport = async () => {
    if (!deleteExportId) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_BASE}/api/admin/exports/${deleteExportId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete export record");
      }

      setExports(exports.filter((e) => e.id !== deleteExportId));
      setDeleteOpen(false);
      setDeleteExportId(null);
      toast({
        title: "Export record deleted",
        description: "The export record has been successfully deleted.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error deleting record",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const typeIcons: Record<string, React.ReactNode> = {
    react: <Code className="h-4 w-4" />,
    nextjs: <Code className="h-4 w-4" />,
    html: <Globe className="h-4 w-4" />,
  };

  const typeColors: Record<string, string> = {
    react: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
    nextjs: "text-gray-900 dark:text-white bg-gray-900/10 ring-gray-500/20",
    html: "text-orange-400 bg-orange-500/10 ring-orange-500/20",
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
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export History</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage project exports</p>
          </div>
          {isBackgroundLoading && <Spinner size="sm" className="mt-1" />}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <p>{error}</p>
          <Button onClick={fetchExports} variant="outline" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary-500">
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
            placeholder="Search by project name or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Search exports"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Filter export format"
        >
          <option value="">All Types</option>
          <option value="react">React</option>
          <option value="nextjs">Next.js</option>
          <option value="html">HTML</option>
        </select>
      </div>

      {/* Exports Table */}
      <div className={`space-y-0 transition-opacity duration-200 ${isBackgroundLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">Project</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 sm:table-cell">User</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 md:table-cell">Type</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30 lg:table-cell">Downloads</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 xl:table-cell">Exported</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        No export records found
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                        Try adjusting your search or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  exports.map((exp, i) => (
                    <tr
                      key={exp.id}
                      className={`group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        i !== exports.length - 1 ? "border-b border-gray-200 dark:border-white/[0.04]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.06]">
                            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-gray-900 dark:text-white/80">{exp.projectName}</p>
                            <p className="text-[10px] text-gray-500 dark:text-white/30">{exp.projectId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-xs text-gray-900 dark:text-white/80">{exp.userName || exp.userEmail}</p>
                        <p className="text-[10px] text-gray-500 dark:text-white/30">{exp.userEmail}</p>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex items-center gap-2">
                          {typeIcons[exp.type]}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${typeColors[exp.type]}`}
                          >
                            {exp.type}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-right text-xs text-gray-500 dark:text-white/40 lg:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Download className="h-3 w-3" />
                          {exp.downloadCount}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-white/40 xl:table-cell">
                        {new Date(exp.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => requestDeleteExport(exp.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          title="Delete export record"
                          aria-label={`Delete export record for ${exp.projectName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
            setDeleteExportId(null);
          }
        }}
        onConfirm={confirmDeleteExport}
        title="Delete export record?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
