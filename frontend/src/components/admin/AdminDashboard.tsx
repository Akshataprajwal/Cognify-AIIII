"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Sparkles,
  FolderKanban,
  LayoutTemplate,
  History,
  Activity,
  Shield,
  TrendingUp,
  Server,
  CheckCircle2,
  XCircle,
  Download,
  ArrowUpRight,
  Clock3,
  Layers,
  ScrollText,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalProjects: number;
  totalGenerations: number;
  totalTemplates: number;
  totalExports: number;
  successfulGenerations: number;
  failedGenerations: number;
  dailyGenerations: number;
  weeklyGenerations: number;
  monthlyGenerations: number;
  averageGenerationDuration: number;
}

interface TopProvider {
  provider: string;
  count: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    projects: number;
    generations: number;
  };
}

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

interface ExportRecord {
  id: string;
  format: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  project: {
    id: string;
    name: string;
  };
}

export function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProviders, setTopProviders] = useState<TopProvider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [exportsData, setExportsData] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Admin session is missing. Please sign in again.");
      return;
    }

    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Admin session is missing. Please sign in again.");
        return;
      }

      try {
        const data = await apiFetch<{
          stats: DashboardStats;
          topProviders: TopProvider[];
          recent: {
            users: User[];
            projects: Project[];
            generations: Generation[];
            exports: ExportRecord[];
          };
        }>("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(data.stats ?? null);
        setTopProviders(data.topProviders ?? []);
        setUsers(data.recent?.users ?? []);
        setProjects(data.recent?.projects ?? []);
        setGenerations(data.recent?.generations ?? []);
        setExportsData(data.recent?.exports ?? []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch dashboard data";
        if (message.includes("403") || message.includes("Access denied")) {
          setError("Access denied. Admin privileges required.");
        } else if (message.includes("401") || message.includes("Unauthorized")) {
          setError("Unauthorized. Please sign in again.");
        } else {
          setError(message);
        }
      }
    } catch (err) {
      console.error("[AdminDashboard] fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred while loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats row skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        {/* Chart / recent rows skeleton */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-3xl border border-gray-200 bg-white p-8 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">No dashboard data available</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            The dashboard response did not contain the expected data.
            Please refresh or verify your admin session.
          </p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    ADMIN: "text-red-400 bg-red-500/10 ring-red-500/20",
    USER: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
  };

  const statusColors: Record<string, string> = {
    active: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    suspended: "text-red-400 bg-red-500/10 ring-red-500/20",
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            A complete overview of platform usage, AI generation performance, and user activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Admin view</Badge>
          <Badge variant="outline">{stats.totalUsers} users</Badge>
          <Badge variant="outline">{stats.totalGenerations} generations</Badge>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 xl:grid-cols-4">
        {[
          {
            title: "Total Users",
            value: stats.totalUsers,
            detail: `${stats.activeUsers} active • ${stats.suspendedUsers} suspended`,
            icon: <Users className="h-5 w-5 text-primary-600" />,
          },
          {
            title: "Projects",
            value: stats.totalProjects,
            detail: `${stats.totalTemplates} templates available`,
            icon: <FolderKanban className="h-5 w-5 text-violet-600" />,
          },
          {
            title: "Exports",
            value: stats.totalExports,
            detail: `${stats.totalGenerations} generation exports`,
            icon: <Download className="h-5 w-5 text-emerald-600" />,
          },
          {
            title: "Success Rate",
            value: `${Math.round((stats.successfulGenerations / Math.max(stats.successfulGenerations + stats.failedGenerations, 1)) * 100)}%`,
            detail: `${stats.failedGenerations} failed attempts`,
            icon: <CheckCircle2 className="h-5 w-5 text-amber-600" />,
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {card.title}
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                {card.icon}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{card.detail}</p>
          </div>
        ))}
      </div>

      {/* Performance and provider insights */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI Performance</p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">Average generation time</h2>
            </div>
            <Clock3 className="h-5 w-5 text-sky-600" />
          </div>
          <p className="mt-5 text-4xl font-bold text-slate-900 dark:text-white">
            {stats.averageGenerationDuration} ms
          </p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Based on recent generation activity across the platform.
          </p>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Top AI providers</p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">Most used models</h2>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {topProviders.length > 0 ? (
              topProviders.map((provider) => (
                <div key={provider.provider} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{provider.provider}</p>
                    <Badge variant="accent">{provider.count}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Active request volume</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No provider data available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recent users</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Latest signups</h3>
            </div>
            <Badge variant="default">{users.length}</Badge>
          </div>
          <div className="mt-6 space-y-4">
            {users.length > 0 ? (
              users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
                  <Avatar name={user.name || user.email} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || user.email}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "ADMIN" ? "danger" : "secondary"}>{user.role}</Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 dark:text-slate-400">
                <Users className="h-8 w-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No signups yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recent exports</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Export activity</h3>
            </div>
            <Badge variant="default">{exportsData.length}</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {exportsData.length > 0 ? (
              exportsData.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.project.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.format.toUpperCase()} export</p>
                    </div>
                    <Badge variant="outline">{new Date(item.createdAt).toLocaleDateString()}</Badge>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{item.user.email}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 dark:text-slate-400">
                <Download className="h-8 w-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No exports yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recent generations</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Latest requests</h3>
            </div>
            <Badge variant="default">{generations.length}</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {generations.length > 0 ? (
              generations.slice(0, 5).map((gen) => (
                <div key={gen.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{gen.provider}</p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{gen.prompt.substring(0, 60)}...</p>
                    </div>
                    <Badge variant={gen.status === "SUCCESS" ? "success" : "danger"}>{gen.status.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{new Date(gen.createdAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500 dark:text-slate-400">
                <Activity className="h-8 w-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No generations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
