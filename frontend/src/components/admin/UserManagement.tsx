"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  _count: {
    projects: number;
    generations: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UserManagement() {
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const roleColors: Record<string, string> = {
    ADMIN: "text-red-400 bg-red-500/10 ring-red-500/20",
    USER: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
  };

  const showingRange = useMemo(() => {
    if (!pagination) return null;
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return { start, end };
  }, [pagination]);

  // Debounce search input by 300 ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async () => {
    const isFirst = users.length === 0;
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
      if (roleFilter) params.append("role", roleFilter);

      const data = await apiFetch<{ users: User[]; pagination: PaginationInfo | null }>(
        `/api/admin/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(data.users ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsInitialLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers();
  }, [token, page, debouncedSearch, roleFilter]);

  const requestDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
    setDeleteOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      setDeleting(true);

      await apiFetch<{ message: string }>(
        `/api/admin/users/${deleteUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeleteOpen(false);
      setDeleteUserId(null);
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
        variant: "success",
      });
      await fetchUsers();
    } catch (err) {
      toast({
        title: "Error deleting user",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const hasResults = users.length > 0;

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
          <Skeleton className="h-10 w-24 rounded-xl" />
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
        <Button onClick={fetchUsers} variant="outline" className="focus-visible:ring-2 focus-visible:ring-primary-500">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage platform users and permissions
            </p>
          </div>
          {isBackgroundLoading && <Spinner size="sm" className="mt-1" />}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Search users"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className={`space-y-0 transition-opacity duration-200 ${isBackgroundLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">
                    User
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 sm:table-cell">
                    Role
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30 lg:table-cell">
                    Projects
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30 lg:table-cell">
                    Generations
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 xl:table-cell">
                    Last Login
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {!hasResults ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        No users found
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                        Try adjusting your search or role filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => (
                    <tr
                      key={user.id}
                      className={`group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        i !== users.length - 1
                          ? "border-b border-gray-200 dark:border-white/[0.04]"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name || user.email} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-gray-900 dark:text-white/80">
                              {user.name || "Unknown"}
                            </p>
                            <p className="truncate text-[10px] text-gray-500 dark:text-white/30">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${
                            roleColors[user.role] ?? roleColors.USER
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="hidden px-4 py-3 text-right text-xs text-gray-500 dark:text-white/40 lg:table-cell">
                        {user._count.projects}
                      </td>

                      <td className="hidden px-4 py-3 text-right text-xs text-gray-500 dark:text-white/40 lg:table-cell">
                        {user._count.generations}
                      </td>

                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-white/40 xl:table-cell">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => requestDeleteUser(user.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          title="Delete user"
                          aria-label={`Delete user ${user.email}`}
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
        {pagination && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/[0.04] px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-white/25">
              Showing{" "}
              {showingRange ? `${showingRange.start}–${showingRange.end}` : null}{" "}
              of {pagination.total}
            </p>

            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(pagination.totalPages, p + 1)
                  )
                }
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
            setDeleteUserId(null);
          }
        }}
        onConfirm={confirmDeleteUser}
        title="Delete user?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}

