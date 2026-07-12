"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";
import { API_BASE } from "@/lib/api";

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TemplateUI = Template & {
  // cached derived fields for UI
  categoryLabel: string;
  featuredLabel: string;
  visibilityLabel: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Landing Pages": "text-blue-400 bg-blue-500/10 ring-blue-500/20",
  Dashboards: "text-purple-400 bg-purple-500/10 ring-purple-500/20",
  "E-commerce": "text-green-400 bg-green-500/10 ring-green-500/20",
  Blogs: "text-orange-400 bg-orange-500/10 ring-orange-500/20",
};

export function TemplateManagement() {
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<TemplateUI[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [page, setPage] = useState(1);

  // Modal deletion state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggling featured status spinner
  const [togglingTemplateId, setTogglingTemplateId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const loadTemplates = async () => {
      const isFirst = templates.length === 0;
      try {
        if (isFirst) {
          setIsInitialLoading(true);
        } else {
          setIsBackgroundLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (categoryFilter) params.append("category", categoryFilter);

        const data = await apiFetch<{ templates: Template[]; pagination: PaginationInfo }>(
          `/api/admin/templates?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTemplates((data.templates ?? []).map((template: Template) => ({
          ...template,
          categoryLabel: template.category,
          featuredLabel: template.isFeatured ? "Featured" : "Not Featured",
          visibilityLabel: template.isPublic ? "Public" : "Private",
        })));
        setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsInitialLoading(false);
        setIsBackgroundLoading(false);
      }
    };

    if (token) {
      loadTemplates();
    }
  }, [token, page, debouncedSearch, categoryFilter]);

  const requestDeleteTemplate = (templateId: string) => {
    setDeleteTemplateId(templateId);
    setDeleteOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteTemplateId) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `${API_BASE}/api/admin/templates/${deleteTemplateId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      setTemplates(templates.filter((t) => t.id !== deleteTemplateId));
      setDeleteOpen(false);
      setDeleteTemplateId(null);
      toast({
        title: "Template deleted",
        description: "The template has been successfully deleted.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error deleting template",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (templateId: string) => {
    try {
      setTogglingTemplateId(templateId);
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      await apiFetch<{ template: Template }>(
        `/api/admin/templates/${templateId}/featured`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isFeatured: !template.isFeatured }),
        }
      );

      setTemplates(
        templates.map((t) =>
          t.id === templateId ? { ...t, isFeatured: !t.isFeatured, featuredLabel: !t.isFeatured ? "Featured" : "Not Featured" } : t
        )
      );
      toast({
        title: "Featured status updated",
        description: `Featured status for template updated successfully.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Error updating featured status",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "error",
      });
    } finally {
      setTogglingTemplateId(null);
    }
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
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Management</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage code generation templates</p>
          </div>
          {isBackgroundLoading && <Spinner size="sm" className="mt-1" />}
        </div>
        <Button className="focus-visible:ring-2 focus-visible:ring-primary-500">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <p>{error}</p>
          <Button onClick={() => setPage(1)} variant="outline" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary-500">
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
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Search templates"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          <option value="Landing Pages">Landing Pages</option>
          <option value="Dashboards">Dashboards</option>
          <option value="E-commerce">E-commerce</option>
          <option value="Blogs">Blogs</option>
        </select>
      </div>

      {/* Templates Table */}
      <div className={`space-y-0 transition-opacity duration-200 ${isBackgroundLoading ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30">Template</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 sm:table-cell">Category</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 md:table-cell">Status</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 lg:table-cell">Featured</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/30 xl:table-cell">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        No templates found
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                        Try adjusting your search query or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  templates.map((template, i) => (
                    <tr
                      key={template.id}
                      className={`group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                        i !== templates.length - 1 ? "border-b border-gray-200 dark:border-white/[0.04]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-gray-900 dark:text-white/80">{template.name}</p>
                          <p className="truncate text-[10px] text-gray-500 dark:text-white/30">{template.description}</p>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${CATEGORY_COLORS[template.category] || 'text-gray-400 bg-gray-500/10 ring-gray-500/20'}`}
                        >
                          {template.category}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${template.isPublic ? "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20" : "text-gray-400 bg-gray-500/10 ring-gray-500/20"}`}
                        >
                          {template.isPublic ? "Public" : "Private"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {togglingTemplateId === template.id ? (
                          <Spinner size="sm" className="text-yellow-400" />
                        ) : (
                          <button
                            onClick={() => handleToggleFeatured(template.id)}
                            className="flex items-center gap-1 text-gray-400 hover:text-yellow-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/80 rounded"
                            aria-label={template.isFeatured ? `Unfeature template ${template.name}` : `Feature template ${template.name}`}
                          >
                            {template.isFeatured ? <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> : <StarOff className="h-4 w-4" />}
                          </button>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-white/40 xl:table-cell">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            title="Edit template"
                            aria-label={`Edit template ${template.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                            title="Duplicate template"
                            aria-label={`Duplicate template ${template.name}`}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => requestDeleteTemplate(template.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            title="Delete template"
                            aria-label={`Delete template ${template.name}`}
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
            setDeleteTemplateId(null);
          }
        }}
        onConfirm={confirmDeleteTemplate}
        title="Delete template?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}

