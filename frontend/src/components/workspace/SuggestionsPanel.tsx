"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface SuggestionsPanelProps {
  onSelectSuggestion: (directive: string) => void;
  visible: boolean;
}

const AI_SUGGESTIONS = [
  { id: "resp", label: "Improve responsiveness", directive: "Make the layout fully responsive on all viewport screens using tailwind breakpoints (sm, md, lg)." },
  { id: "access", label: "Improve accessibility", directive: "Add correct aria attributes, semantic html landmarks, focus rings, and readable contrast profiles." },
  { id: "perf", label: "Optimize performance", directive: "Optimize assets, clean layout structure, use light elements, and prune redundant wrapper divs." },
  { id: "simpl", label: "Simplify code", directive: "Simplify state architecture, optimize inline conditions, and reduce style class complexities." },
  { id: "tw", label: "Convert CSS to Tailwind", directive: "Refactor custom CSS stylings into inline Tailwind CSS utility declarations." },
  { id: "anim", label: "Add transitions & animations", directive: "Integrate subtle CSS transitions, hover scales, and clean component entry animations." },
  { id: "ts", label: "Convert JS to TypeScript", directive: "Refactor functions to include strict TypeScript type safety declarations." },
];

export function SuggestionsPanel({ onSelectSuggestion, visible }: SuggestionsPanelProps) {
  if (!visible) return null;

  return (
    <div className="p-6 border-b border-white/[0.06] bg-[#0c0c12]/40 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">AI Optimization Directives</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {AI_SUGGESTIONS.map((sug) => (
          <button
            key={sug.id}
            onClick={() => onSelectSuggestion(sug.directive)}
            className="flex items-center justify-between text-left rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-indigo-650/10 hover:border-indigo-500/20 px-4 py-2.5 text-xs text-white/50 hover:text-indigo-300 transition-all group"
          >
            <span>{sug.label}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
