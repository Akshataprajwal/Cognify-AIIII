"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/apiRequest";

interface SystemMetrics {
  id: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  nodeVersion: string;
  environment: string;
  databaseStatus: string;
  apiStatus: string;
  frontendStatus: string;
  backendStatus: string;
  createdAt: string;
}

interface MaintenanceInfo {
  maintenanceMode: boolean;
  message: string | null;
}

export function SystemStatus() {
  const { token } = useAuthStore();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ metrics: SystemMetrics | null; settings: MaintenanceInfo }>(
        "/api/admin/system-status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMetrics(data.metrics);
      setMaintenance(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    if (status === "connected" || status === "operational") {
      return "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20";
    }
    if (status === "disconnected" || status === "down") {
      return "text-red-400 bg-red-500/10 ring-red-500/20";
    }
    return "text-amber-400 bg-amber-500/10 ring-amber-500/20";
  };

  const getStatusIcon = (status: string) => {
    if (status === "connected" || status === "operational") {
      return <CheckCircle className="h-4 w-4" />;
    }
    if (status === "disconnected" || status === "down") {
      return <XCircle className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-36 rounded-lg" />
            <div className="mt-2">
              <Skeleton className="h-4 w-56 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-3xl border border-gray-200 bg-white p-8 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System status unavailable</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchSystemStatus} className="focus-visible:ring-2 focus-visible:ring-primary-500">Retry</Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-3xl border border-gray-200 bg-white p-8 shadow-sm shadow-slate-900/3 dark:border-white/10 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No system metrics available</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">The backend is running but could not load system status data.</p>
          <Button onClick={fetchSystemStatus} className="mt-4 focus-visible:ring-2 focus-visible:ring-primary-500">Retry</Button>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Status</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Monitor system health and performance</p>
          </div>
          {loading && metrics && <Spinner size="sm" className="mt-1" />}
        </div>
        <Button onClick={fetchSystemStatus} variant="outline" size="sm" className="focus-visible:ring-2 focus-visible:ring-primary-500">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {maintenance?.maintenanceMode && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <p className="text-sm text-amber-400">
            Maintenance mode is enabled: {maintenance.message || "System under maintenance"}
          </p>
        </div>
      )}

      {/* Service Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Database", status: metrics.databaseStatus, icon: Database },
          { name: "API", status: metrics.apiStatus, icon: Server },
          { name: "Frontend", status: metrics.frontendStatus, icon: Globe },
          { name: "Backend", status: metrics.backendStatus, icon: Server },
        ].map((service) => (
          <div
            key={service.name}
            className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <service.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</span>
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
                <span>{service.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Usage */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.cpuUsage.toFixed(1)}%</span>
              <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-white/[0.1] overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${metrics.cpuUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Memory Usage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.memoryUsage.toFixed(1)}%</span>
              <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-white/[0.1] overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${metrics.memoryUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Disk Usage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.diskUsage.toFixed(1)}%</span>
              <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-white/[0.1] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${metrics.diskUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">Environment</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{metrics.environment}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">Node Version</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{metrics.nodeVersion}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">Uptime</p>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gray-500 dark:text-white/40" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatUptime(metrics.uptime)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 dark:text-white/30 uppercase tracking-wider">Last Updated</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(metrics.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
