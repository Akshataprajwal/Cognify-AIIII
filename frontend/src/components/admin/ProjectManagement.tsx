"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";
import { API_BASE } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  prompt: string | null;
  aiProvider: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  _count: {
    versions: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ProjectManagement() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal deletion state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token, page, debouncedSearch]);

  const fetchProjects = async () => {
    const isFirst = projects.length === 0;
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

      const data = await apiFetch<{ projects: Project[]; pagination: PaginationInfo }>(
        `/api/admin/projects?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(data.projects ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsInitialLoading(false);
      setIsBackgroundLoading(false);
    }
  };

  const requestDeleteProject = (projectId: string) => {
    setDeleteProjectId(projectId);
    setDeleteOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_BASE}/api/admin/projects/${deleteProjectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setDeleteOpen(false);
      setDeleteProjectId(null);
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
        variant: "success",
      });
      await fetchProjects();
    } catch (err) {
      toast({
        title: "Error deleting project",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
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
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Management</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage all platform projects</p>
          </div>
          {isBackgroundLoading && <Spinner size="sm" className="mt-1" />}
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <p>{error}</p>
          <Button onClick={fetchProjects} variant="outline" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary-500">
            Retry
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search projects by name or prompt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Search projects"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className={`space-y-0 transition-opacity duration-200 ${isBackgroundLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">Project</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 sm:table-cell">Owner</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 md:table-cell">Provider</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30 lg:table-cell">Versions</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 xl:table-cell">Created</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 xl:table-cell">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        No projects found
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                        Try adjusting your search query.
                      </p>
                    </td>
                  </tr>
                ) : (
                  projects.map((project, i) => (
                    <tr
                      key={project.id}
                      className={`group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        i !== projects.length - 1 ? "border-b border-gray-200 dark:border-white/[0.04]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-gray-900 dark:text-white/80">{project.name}</p>
                          <p className="truncate text-[10px] text-gray-500 dark:text-white/30">{project.prompt?.substring(0, 50) || "No prompt"}...</p>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-xs text-gray-900 dark:text-white/80">{project.user.name || project.user.email}</p>
                        <p className="text-[10px] text-gray-500 dark:text-white/30">{project.user.email}</p>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${providerColors[project.aiProvider] || providerColors.unknown}`}
                        >
                          {project.aiProvider}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-right text-xs text-gray-500 dark:text-white/40 lg:table-cell">
                        {project._count.versions}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-white/40 xl:table-cell">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-white/40 xl:table-cell">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            title="View project"
                            aria-label={`View project ${project.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            title="Duplicate project"
                            aria-label={`Duplicate project ${project.name}`}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => requestDeleteProject(project.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            title="Delete project"
                            aria-label={`Delete project ${project.name}`}
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
            setDeleteProjectId(null);
          }
        }}
        onConfirm={confirmDeleteProject}
        title="Delete project?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
