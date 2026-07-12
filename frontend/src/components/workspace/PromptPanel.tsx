"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Trash2, ArrowUpRight, Loader2, Wand2, Square } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { ProviderSelector } from "./ProviderSelector";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";

interface PromptPanelProps {
  onGenerate: (prompt: string) => void;
}

const QUICK_SUGGESTIONS = [
  "Modern travel booking landing page with Tailwind",
  "SaaS Dashboard UI with analytics graphs",
  "E-commerce product detail page with reviews",
  "Interactive signup form with glassmorphism style",
];

export function PromptPanel({ onGenerate }: PromptPanelProps) {
  const { isGenerating, cancelGeneration, currentProject } = useProjectStore();
  const [prompt, setPrompt] = useState("");

  // Sync with current project prompt on selection changes
  useEffect(() => {
    if (currentProject) {
      setPrompt(currentProject.prompt || "");
    }
  }, [currentProject]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isGenerating) {
        onGenerate(prompt.trim());
      }
    }
  };

  const handleImprove = async () => {
    if (!prompt.trim()) return;
    try {
      const improved = await aiService.improvePrompt(prompt.trim());
      setPrompt(improved);
      toast.success("Prompt enhanced");
    } catch {
      const improved = `${prompt.trim()} — designed with a premium dark theme, highly interactive states, custom animations, clean structural layouts, and fully polished Tailwind CSS styling.`;
      setPrompt(improved);
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] bg-[#0a0a0f] p-6 select-none shrink-0">
      <ProviderSelector compact />
      {/* Input container */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
        <textarea
          id="prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Create a modern travel booking landing page using React and Tailwind CSS."
          className="w-full min-h-[90px] max-h-[160px] bg-transparent text-sm text-white placeholder-white/20 outline-none resize-y"
          disabled={isGenerating}
          maxLength={1000}
        />

        {/* Counter and status indicators */}
        <div className="flex justify-end text-[10px] text-white/20 select-none pb-1">
          <span>{prompt.length} / 1000 characters</span>
        </div>

        {/* Textarea Bottom Action Bar */}
        <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-2 text-xs">
          <div className="flex gap-2">
            <button
              onClick={handleImprove}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Enhance your prompt with professional UI directives"
            >
              <Wand2 className="h-3 w-3 text-indigo-400" />
              <span>Improve</span>
            </button>
            <button
              onClick={() => setPrompt("")}
              disabled={!prompt || isGenerating}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-red-400/80 transition-colors disabled:opacity-40"
              title="Clear input"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>

          {isGenerating ? (
            <button
              onClick={cancelGeneration}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 font-semibold text-white shadow-lg shadow-red-650/20 transition-all"
            >
              <Square className="h-3.5 w-3.5 fill-white text-transparent" />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              onClick={() => onGenerate(prompt.trim())}
              disabled={!prompt.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span>Generate UI</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-white/20 tracking-wider">Quick Prompts:</span>
        {QUICK_SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(sug)}
            className="inline-flex items-center gap-1 rounded-full border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.08] px-3 py-1 text-[11px] text-white/40 hover:text-white/80 transition-all text-left"
          >
            {sug.split(" with ")[0]}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
