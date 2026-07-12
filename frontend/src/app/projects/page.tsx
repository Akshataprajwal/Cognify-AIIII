"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FolderOpen,
  Sparkles,
  Clock,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  Filter,
  Heart,
  Undo
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, deleteProject, toggleFavorite } = useProjectStore();
  const [search, setSearch] = useState("");

  const handleFav = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(id);
    toast.success("Project updated");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    deleteProject(id);
    toast.info("Project deleted");
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Projects</h1>
          <p className="mt-1 text-sm text-white/40">
            {filtered.length} projects total
          </p>
        </div>
        <Link
          href="/ai-workspace"
          id="new-project-btn"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            id="project-search"
            type="search"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-white/[0.08] py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <FolderOpen className="h-7 w-7 text-white/20" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/50">No projects found</p>
            <p className="mt-1 text-xs text-white/25">
              Open the AI Workspace to generate your first UI
            </p>
          </div>
          <Link
            href="/ai-workspace"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Start generating
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <article
              key={project.id}
              className="group relative flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition-all hover:border-indigo-500/20 hover:bg-white/[0.04]"
            >
              {/* Status/Fav Section */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  <h2 className="text-sm font-semibold text-white truncate">{project.name}</h2>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleFav(e, project.id)}
                    className="p-1 rounded text-white/20 hover:text-amber-400 hover:bg-white/5 transition-colors"
                  >
                    <Heart className={`h-3.5 w-3.5 ${project.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-white/40 line-clamp-2 min-h-[32px]">
                {project.prompt || "No prompt entered."}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {(project.tags || ["Design"]).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-3">
                <div className="flex items-center gap-3 text-[11px] text-white/30">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  href={`/ai-workspace?project=${project.id}`}
                  aria-label={`Open ${project.name}`}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 opacity-0 transition-all hover:text-indigo-350 group-hover:opacity-100"
                >
                  Open Sandbox
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
