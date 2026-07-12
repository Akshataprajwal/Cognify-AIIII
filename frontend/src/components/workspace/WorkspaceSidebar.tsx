"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Folder, 
  LayoutTemplate, 
  History, 
  Star, 
  MessageSquare,
  ChevronLeft,
  Settings,
  CreditCard,
  Trash2,
  Heart,
  Search
} from "lucide-react";
import Link from "next/link";
import { useProjectStore, Project } from "@/store/projectStore";
import { toast } from "sonner";

interface WorkspaceSidebarProps {
  onSelectPrompt: (prompt: string) => void;
}

export function WorkspaceSidebar({ onSelectPrompt }: WorkspaceSidebarProps) {
  const { 
    projects, 
    currentProject, 
    promptHistory, 
    createProject, 
    setCurrentProject,
    deleteProject,
    toggleFavorite 
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<"projects" | "favorites" | "history">("projects");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewProject = () => {
    const proj = createProject("New Project", "", {
      react: "",
      html: "",
      css: "",
      js: "",
      ts: "",
    });
    toast.success(`Created workspace: ${proj.name}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    deleteProject(id);
    toast.info("Project deleted successfully");
  };

  const handleFav = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(id);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = activeTab === "favorites" ? p.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  return (
    <aside className="w-64 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col h-full text-white/70 select-none shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg">
            C
          </span>
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-sm font-bold text-transparent">
            Cognify AI
          </span>
        </Link>
        <Link 
          href="/dashboard" 
          className="p-1.5 rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors"
          title="Back to Dashboard"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* New Project CTA */}
      <div className="p-4">
        <button
          onClick={handleNewProject}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Project Search */}
      {activeTab !== "history" && (
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-3 text-xs text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/55 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 flex border-b border-white/[0.04] text-[11px] font-semibold text-white/40">
        <button 
          onClick={() => setActiveTab("projects")}
          className={`flex-1 pb-2 border-b-2 text-center transition-colors ${activeTab === "projects" ? "text-indigo-450 border-indigo-550" : "border-transparent hover:text-white/70"}`}
        >
          Projects
        </button>
        <button 
          onClick={() => setActiveTab("favorites")}
          className={`flex-1 pb-2 border-b-2 text-center transition-colors ${activeTab === "favorites" ? "text-indigo-450 border-indigo-550" : "border-transparent hover:text-white/70"}`}
        >
          Favorites
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex-1 pb-2 border-b-2 text-center transition-colors ${activeTab === "history" ? "text-indigo-450 border-indigo-550" : "border-transparent hover:text-white/70"}`}
        >
          History
        </button>
      </div>

      {/* Dynamic List Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {activeTab !== "history" ? (
          filteredProjects.length === 0 ? (
            <p className="text-xs text-white/20 italic px-3 py-2">
              {activeTab === "favorites" ? "No favorites yet" : "No projects yet"}
            </p>
          ) : (
            filteredProjects.map((p) => {
              const active = currentProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setCurrentProject(p)}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-all ${
                    active 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" 
                      : "text-white/50 hover:bg-white/[0.03] hover:text-white/80 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Folder className={`h-3.5 w-3.5 shrink-0 ${active ? "text-indigo-400" : "text-white/20"}`} />
                    <span className="truncate">{p.name}</span>
                  </div>
                  
                  {/* Hover operations */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleFav(e, p.id)}
                      className="p-1 rounded text-white/20 hover:text-amber-400 hover:bg-white/5 transition-colors"
                      title={p.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Heart className={`h-3 w-3 ${p.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          <div className="space-y-3">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-white/20 px-3 flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" /> Recent Queries
            </p>
            {promptHistory.length === 0 ? (
              <p className="text-xs text-white/20 italic px-3">No prompts yet</p>
            ) : (
              <ul className="space-y-1">
                {promptHistory.map((prompt, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onSelectPrompt(prompt)}
                      className="w-full text-left rounded-xl px-3 py-2 text-xs text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-all truncate block"
                      title={prompt}
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Navigation shortcuts */}
      <div className="px-3 py-2 space-y-0.5 border-t border-white/[0.04]">
        <Link
          href="/templates"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-white/45 hover:bg-white/[0.03] hover:text-white/80 transition-all"
        >
          <LayoutTemplate className="h-4 w-4 text-white/25" />
          <span>Templates Gallery</span>
        </Link>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/[0.06] flex items-center justify-between text-white/30 text-xs shrink-0">
        <Link href="/settings" className="hover:text-white/70 transition-colors flex items-center gap-1">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </Link>
        <Link href="/billing" className="hover:text-white/70 transition-colors flex items-center gap-1">
          <CreditCard className="h-3.5 w-3.5" />
          Pro Plan
        </Link>
      </div>
    </aside>
  );
}
