"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

/** Routes that have their own full layout — AppShell renders children directly */
const PASSTHROUGH_ROUTES = [
  "/dashboard",
  "/ai-workspace",
  "/projects",
  "/settings",
  "/billing",
  "/history",
  "/admin",
  "/login",
  "/register",
  "/forgot-password",
];

/** Landing/marketing routes — render Navbar above children, no sidebar */
const MARKETING_ROUTES = ["/", "/templates"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isPassthrough = PASSTHROUGH_ROUTES.some((r) => pathname.startsWith(r));
  const isMarketing = MARKETING_ROUTES.some((r) =>
    r === "/" ? pathname === "/" : pathname.startsWith(r)
  );

  // Dashboard/auth pages manage their own full layout — render naked
  if (isPassthrough) {
    return <>{children}</>;
  }

  // Marketing pages — Navbar + full-bleed content
  if (isMarketing) {
    return (
      <div className="min-h-dvh bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50">
        <Navbar />
        <main id="main-content">{children}</main>
      </div>
    );
  }

  // Fallback — Navbar + main content (no sidebar for now)
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      <Navbar />
      <main id="main-content" className="px-4 py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
