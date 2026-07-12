"use client";

import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

/**
 * Admin route layout — completely separate from the user dashboard layout.
 * Uses AdminLayout (admin sidebar + admin topbar), NOT DashboardSidebar/Topbar.
 * Only accessible to users with role === "ADMIN" (enforced by Next.js middleware).
 */
export default function AdminRouteLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
