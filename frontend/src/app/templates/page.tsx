"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  LayoutTemplate,
  ShoppingBag,
  Lock,
  BarChart3,
  FileText,
  Mail,
  Star,
  ArrowRight,
  UtensilsCrossed,
  Activity,
  GraduationCap,
  Compass,
  Wallet
} from "lucide-react";
import { starterTemplates } from "@/services/templateService";

const CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "landing", label: "Landing Pages" },
  { id: "dashboard", label: "Dashboards" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "blog", label: "Blog" },
];

const iconMap: Record<string, React.ReactNode> = {
  "saas-landing": <Sparkles className="h-6 w-6 text-indigo-400" />,
  "admin-dashboard": <BarChart3 className="h-6 w-6 text-cyan-400" />,
  "portfolio": <LayoutTemplate className="h-6 w-6 text-slate-400" />,
  "ecommerce": <ShoppingBag className="h-6 w-6 text-emerald-400" />,
  "restaurant": <UtensilsCrossed className="h-6 w-6 text-rose-400" />,
  "healthcare": <Activity className="h-6 w-6 text-blue-400" />,
  "education": <GraduationCap className="h-6 w-6 text-violet-400" />,
  "travel": <Compass className="h-6 w-6 text-indigo-400" />,
  "finance": <Wallet className="h-6 w-6 text-pink-400" />,
  "blog": <FileText className="h-6 w-6 text-amber-400" />
};

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = starterTemplates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-7 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Starter Templates</h1>
          <p className="mt-1 text-sm text-white/40">
            Select one of our {starterTemplates.length} templates to jumpstart your workspace
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          id="template-search"
          type="search"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>

      {/* Category pills */}
      <div
        id="template-category-filter"
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Template categories"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === cat.id
                ? "bg-indigo-650 text-white shadow-lg shadow-indigo-500/20"
                : "border border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-white/[0.15] hover:text-white/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((tpl) => (
          <article
            key={tpl.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] transition-all hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5"
          >
            {/* Preview area */}
            <div
              className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${tpl.gradient} border-b border-white/[0.06]`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.08] backdrop-blur-sm">
                {iconMap[tpl.id] || <LayoutTemplate className="h-6 w-6 text-slate-450" />}
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div>
                <h2 className="text-sm font-semibold text-white">{tpl.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-white/40 line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-auto pt-2">
                <Link
                  href={`/ai-workspace?template=${tpl.id}`}
                  id={`use-template-${tpl.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/0 border border-white/[0.08] py-2.5 text-xs font-semibold text-white/50 transition-all group-hover:border-indigo-500/40 group-hover:bg-indigo-600 group-hover:text-white"
                >
                  Use Template
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
