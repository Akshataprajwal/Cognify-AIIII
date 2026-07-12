"use client";

import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/ai-workspace", label: "AI Workspace" },
  { href: "/projects", label: "Projects" },
  { href: "/templates", label: "Templates" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" }
];

export function Sidebar() {
  return (
    <nav className="space-y-1 rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-900">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-md px-2 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
