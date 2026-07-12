"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface LoginHistory {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
  user?: {
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

export function SecurityPanel() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"audit" | "login">("audit");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [auditPagination, setAuditPagination] = useState<PaginationInfo | null>(null);
  const [loginPagination, setLoginPagination] = useState<PaginationInfo | null>(null);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    } else {
      fetchLoginHistory();
    }
  }, [token, page, activeTab]);

  const fetchAuditLogs = async () => {
    const isFirst = auditLogs.length === 0;
    try {
      if (isFirst) {
        setIsInitialLoading(true);
      } else {
        setIsBackgroundLoading(true);
      }
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      const data = await apiFetch<{ logs: AuditLog[]; pagination: PaginationInfo }>(
        `/api/admin/audit-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAuditLogs(data.logs ?? []);
      setAuditPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsInitialLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    const isFirst = loginHistory.length === 0;
    try {
      if (isFirst) {
        setIsInitialLoading(true);
      } else {
        setIsBackgroundLoading(true);
      }
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });

      const data = await apiFetch<{ logs: LoginHistory[]; pagination: PaginationInfo }>(
        `/api/admin/login-history?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoginHistory(data.logs ?? []);
      setLoginPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsInitialLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const handleRetry = () => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    } else {
      fetchLoginHistory();
    }
  };

  const currentPagination = activeTab === "audit" ? auditPagination : loginPagination;
  const currentData: (AuditLog | LoginHistory)[] = activeTab === "audit" ? auditLogs : loginHistory;

  const emptyLabel =
    activeTab === "audit"
      ? "No audit log entries found."
      : "No login history entries found.";

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40 rounded-lg" />
          <div className="mt-2">
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
        </div>

        <div className="flex gap-4 border-b border-gray-200 dark:border-white/[0.06] pb-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Panel</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Audit logs and login history</p>
          </div>
          {isBackgroundLoading && <Spinner size="sm" className="mt-1" />}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <p>{error}</p>
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-white/[0.06]" role="tablist">
        <button
          onClick={() => { setActiveTab("audit"); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-md ${
            activeTab === "audit"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
          aria-selected={activeTab === "audit"}
          role="tab"
          aria-controls="audit-panel"
        >
          Audit Logs
        </button>
        <button
          onClick={() => { setActiveTab("login"); setPage(1); }}
          className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-md ${
            activeTab === "login"
              ? "text-primary-600 border-b-2 border-primary-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
          aria-selected={activeTab === "login"}
          role="tab"
          aria-controls="login-panel"
        >
          Login History
        </button>
      </div>

      {/* Data Table */}
      <div className={`space-y-0 transition-opacity duration-200 ${isBackgroundLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">
                    {activeTab === "audit" ? "Action" : "Status"}
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 sm:table-cell">
                    {activeTab === "audit" ? "Resource" : "IP Address"}
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 md:table-cell">
                    {activeTab === "audit" ? "IP Address" : "Failure Reason"}
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 lg:table-cell">User Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">Created</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {emptyLabel}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                        Activity will appear here once recorded.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, i) => (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        i !== currentData.length - 1 ? "border-b border-gray-200 dark:border-white/[0.04]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-900 dark:text-white/80">
                          {item.user?.name || item.user?.email || "System"}
                        </p>
                        {item.user?.email && (
                          <p className="text-[10px] text-gray-500 dark:text-white/30">{item.user.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {activeTab === "audit" ? (
                            <span className="text-xs text-gray-900 dark:text-white/80">{(item as AuditLog).action}</span>
                          ) : (
                            <>
                              {(item as LoginHistory).success ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-xs text-gray-900 dark:text-white/80">
                                {(item as LoginHistory).success ? "Success" : "Failed"}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-xs text-gray-900 dark:text-white/80">
                          {activeTab === "audit" ? (item as AuditLog).resource : (item as LoginHistory).ipAddress || "Unknown"}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <p className="text-xs text-gray-900 dark:text-white/80">
                          {activeTab === "audit" ? (item as AuditLog).ipAddress || "Unknown" : (item as LoginHistory).failureReason || "N/A"}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-white/40 lg:table-cell">
                        <p className="truncate max-w-xs">{item.userAgent || "Unknown"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-white/40">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {currentPagination && currentPagination.total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/[0.04] px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-white/25">
              Showing {(currentPagination.page - 1) * currentPagination.limit + 1}–{Math.min(currentPagination.page * currentPagination.limit, currentPagination.total)} of {currentPagination.total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPagination.page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(currentPagination.totalPages, p + 1))}
                disabled={currentPagination.page === currentPagination.totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
