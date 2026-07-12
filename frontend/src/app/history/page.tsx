"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  ChevronRight,
  Filter,
  CalendarDays,
  Play,
  Search
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "sonner";

export default function HistoryPage() {
  const router = useRouter();
  const { promptHistory, createProject } = useProjectStore();
  const [search, setSearch] = useState("");

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  };

  const handleReRun = (prompt: string) => {
    // Start a new project using this prompt and redirect
    const proj = createProject(`Prompt Re-run`, prompt);
    toast.success("Created project from historical prompt");
    router.push(`/ai-workspace?project=${proj.id}`);
  };

  const filteredHistory = promptHistory.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Generation History</h1>
          <p className="mt-1 text-sm text-white/40">
            {promptHistory.length} total prompt generations recorded
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="search"
          placeholder="Filter past prompts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/30"
        />
      </div>

      {/* Timeline list */}
      <div className="space-y-2">
        {filteredHistory.length === 0 ? (
          <p className="text-xs text-white/20 italic p-6 border border-dashed border-white/[0.08] rounded-2xl text-center">
            No history matched.
          </p>
        ) : (
          filteredHistory.map((prompt, i) => (
            <div key={i}>
              <div className="group flex items-start gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-5 py-4 transition-all hover:border-white/[0.08] hover:bg-white/[0.035]">
                {/* Left status symbol */}
                <div className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset text-emerald-400 bg-emerald-500/10 ring-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Success</span>
                </div>

                {/* Center: prompt */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">{prompt}</p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleCopy(prompt)}
                    aria-label="Copy prompt"
                    title="Copy prompt"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 transition-colors hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleReRun(prompt)}
                    aria-label="Run prompt in workspace"
                    title="Run prompt in workspace"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/80 text-white transition-colors hover:bg-indigo-650"
                  >
                    <Play className="h-3.5 w-3.5 fill-white text-transparent" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
